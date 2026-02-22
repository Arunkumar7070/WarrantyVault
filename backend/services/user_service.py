from fastapi import HTTPException, status

from auth.security import build_sign_message, create_access_token, generate_nonce, verify_wallet_signature
from database.mongodb import get_database
from models.common import UserRole, utcnow
from models.user import COLLECTION as USERS_COLLECTION
from schemas.auth import LoginResponse, NonceResponse, UserProfile


def _to_profile(doc: dict) -> UserProfile:
    return UserProfile(
        wallet=doc["wallet"],
        name=doc.get("name"),
        email=doc.get("email"),
        role=UserRole(doc["role"]),
        createdAt=doc["createdAt"],
    )


async def get_nonce(wallet: str) -> NonceResponse:
    wallet = wallet.lower()
    db = get_database()
    nonce = generate_nonce()
    await db[USERS_COLLECTION].update_one(
        {"wallet": wallet},
        {
            "$set": {"nonce": nonce},
            "$setOnInsert": {
                "role": UserRole.CUSTOMER,
                "name": None,
                "email": None,
                "createdAt": utcnow().isoformat(),
            },
        },
        upsert=True,
    )
    return NonceResponse(wallet=wallet, message=build_sign_message(wallet, nonce))


async def login(wallet: str, signature: str) -> LoginResponse:
    wallet = wallet.lower()
    db = get_database()
    user = await db[USERS_COLLECTION].find_one({"wallet": wallet})
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request a nonce first")

    message = build_sign_message(wallet, user["nonce"])
    if not verify_wallet_signature(wallet, message, signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    # Rotate the nonce so the signature can't be replayed.
    new_nonce = generate_nonce()
    await db[USERS_COLLECTION].update_one({"wallet": wallet}, {"$set": {"nonce": new_nonce}})

    token = create_access_token(wallet=wallet, role=user["role"])
    return LoginResponse(accessToken=token, user=_to_profile(user))


async def get_profile(wallet: str) -> UserProfile:
    db = get_database()
    user = await db[USERS_COLLECTION].find_one({"wallet": wallet.lower()})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _to_profile(user)


async def update_profile(wallet: str, name: str | None, email: str | None) -> UserProfile:
    db = get_database()
    update: dict = {}
    if name is not None:
        update["name"] = name
    if email is not None:
        update["email"] = email
    if update:
        await db[USERS_COLLECTION].update_one({"wallet": wallet.lower()}, {"$set": update})
    return await get_profile(wallet)
