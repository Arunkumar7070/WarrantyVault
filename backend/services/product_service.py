from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from auth.dependencies import CurrentUser
from blockchain.service import verify_registration_onchain, verify_transfer_onchain
from config import get_settings
from database.mongodb import get_database
from models.common import UserRole, WarrantyStatus, utcnow
from models.product import COLLECTION as PRODUCTS_COLLECTION
from models.transfer import COLLECTION as TRANSFERS_COLLECTION
from models.warranty import COLLECTION as WARRANTIES_COLLECTION
from schemas.product import (
    ProductCreateRequest,
    ProductResponse,
    TransferRequest,
    TransferResponse,
    WarrantySummary,
)
from services.warranty_utils import compute_expiry_date, compute_offline_status

REGISTRAR_ROLES = {UserRole.MANUFACTURER, UserRole.RETAILER, UserRole.ADMIN}


def to_product_response(doc: dict, warranty_doc: dict | None) -> ProductResponse:
    warranty_summary = None
    if warranty_doc:
        warranty_summary = WarrantySummary(
            warrantyId=warranty_doc["warrantyId"],
            contractAddress=warranty_doc["contractAddress"],
            txHash=warranty_doc["txHash"],
            expiryDate=warranty_doc["expiryDate"],
            status=compute_offline_status(warranty_doc["expiryDate"]),
        )
    return ProductResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        brand=doc["brand"],
        category=doc["category"],
        model=doc["model"],
        serialNumber=doc["serialNumber"],
        purchaseDate=doc["purchaseDate"],
        warrantyDurationMonths=doc["warrantyDurationMonths"],
        image=doc.get("image"),
        invoiceCID=doc.get("invoiceCID"),
        ownerWallet=doc["ownerWallet"],
        registeredByWallet=doc["registeredByWallet"],
        createdAt=doc["createdAt"],
        warranty=warranty_summary,
    )


async def get_warranty_for_product(db, product_id: str) -> dict | None:
    return await db[WARRANTIES_COLLECTION].find_one({"productId": product_id})


async def create_product(current_user: CurrentUser, payload: ProductCreateRequest) -> ProductResponse:
    db = get_database()
    owner_wallet = current_user.wallet
    if payload.ownerWallet and payload.ownerWallet.lower() != current_user.wallet.lower():
        if current_user.role not in REGISTRAR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only manufacturers, retailers, or admins may register a product for another wallet",
            )
        owner_wallet = payload.ownerWallet

    expiry_date = compute_expiry_date(payload.purchaseDate, payload.warrantyDurationMonths)

    try:
        object_id = ObjectId(payload.id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product id format")

    product_doc = {
        "_id": object_id,
        "name": payload.name,
        "brand": payload.brand,
        "category": payload.category,
        "model": payload.model,
        "serialNumber": payload.serialNumber,
        "purchaseDate": payload.purchaseDate,
        "warrantyDurationMonths": payload.warrantyDurationMonths,
        "image": payload.image,
        "invoiceCID": payload.invoiceCID,
        "ownerWallet": owner_wallet,
        "registeredByWallet": current_user.wallet,
        "createdAt": utcnow().isoformat(),
    }

    try:
        result = await db[PRODUCTS_COLLECTION].insert_one(product_doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Serial number already registered")

    try:
        warranty_id, onchain_owner = verify_registration_onchain(payload.txHash)
    except Exception as exc:
        await db[PRODUCTS_COLLECTION].delete_one({"_id": product_doc["_id"]})
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to verify on-chain registration: {exc}",
        )

    if onchain_owner.lower() != owner_wallet.lower():
        await db[PRODUCTS_COLLECTION].delete_one({"_id": product_doc["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="On-chain warranty owner does not match registered owner wallet",
        )

    settings = get_settings()
    warranty_doc = {
        "productId": str(product_doc["_id"]),
        "ownerWallet": owner_wallet,
        "purchaseDate": payload.purchaseDate,
        "expiryDate": expiry_date,
        "contractAddress": settings.contract_address,
        "warrantyId": warranty_id,
        "txHash": payload.txHash,
        "status": WarrantyStatus.ACTIVE,
        "createdAt": utcnow().isoformat(),
    }
    await db[WARRANTIES_COLLECTION].insert_one(warranty_doc)

    return to_product_response(product_doc, warranty_doc)


async def list_products(current_user: CurrentUser) -> list[ProductResponse]:
    db = get_database()
    query = {} if current_user.role == UserRole.ADMIN else {"ownerWallet": current_user.wallet}
    cursor = db[PRODUCTS_COLLECTION].find(query).sort("createdAt", -1)
    products = []
    async for doc in cursor:
        warranty_doc = await get_warranty_for_product(db, str(doc["_id"]))
        products.append(to_product_response(doc, warranty_doc))
    return products


async def get_product(product_id: str) -> ProductResponse:
    db = get_database()
    try:
        object_id = ObjectId(product_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    doc = await db[PRODUCTS_COLLECTION].find_one({"_id": object_id})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    warranty_doc = await get_warranty_for_product(db, product_id)
    return to_product_response(doc, warranty_doc)


async def list_transfers(product_id: str) -> list[TransferResponse]:
    db = get_database()
    cursor = db[TRANSFERS_COLLECTION].find({"productId": product_id}).sort("timestamp", -1)
    return [
        TransferResponse(
            id=str(doc["_id"]),
            productId=doc["productId"],
            warrantyId=doc["warrantyId"],
            fromWallet=doc["fromWallet"],
            toWallet=doc["toWallet"],
            txHash=doc["txHash"],
            timestamp=doc["timestamp"],
        )
        async for doc in cursor
    ]


async def transfer_product(
    current_user: CurrentUser, product_id: str, payload: TransferRequest
) -> TransferResponse:
    db = get_database()
    warranty_doc = await get_warranty_for_product(db, product_id)
    if warranty_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warranty not found for product")

    if warranty_doc["ownerWallet"].lower() != current_user.wallet.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only the current owner may transfer this warranty"
        )

    try:
        from_wallet, to_wallet = verify_transfer_onchain(payload.txHash, warranty_doc["warrantyId"])
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not verify transfer transaction on-chain: {exc}",
        )

    if to_wallet.lower() != payload.toWallet.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Transaction recipient does not match toWallet"
        )

    await db[WARRANTIES_COLLECTION].update_one({"productId": product_id}, {"$set": {"ownerWallet": to_wallet}})
    await db[PRODUCTS_COLLECTION].update_one({"_id": ObjectId(product_id)}, {"$set": {"ownerWallet": to_wallet}})

    transfer_doc = {
        "productId": product_id,
        "warrantyId": warranty_doc["warrantyId"],
        "fromWallet": from_wallet,
        "toWallet": to_wallet,
        "txHash": payload.txHash,
        "timestamp": utcnow().isoformat(),
    }
    result = await db[TRANSFERS_COLLECTION].insert_one(transfer_doc)

    return TransferResponse(
        id=str(result.inserted_id),
        productId=product_id,
        warrantyId=warranty_doc["warrantyId"],
        fromWallet=from_wallet,
        toWallet=to_wallet,
        txHash=payload.txHash,
        timestamp=transfer_doc["timestamp"],
    )
