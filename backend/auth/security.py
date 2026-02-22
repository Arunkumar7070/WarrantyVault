import secrets
from datetime import datetime, timedelta, timezone

import jwt
from eth_account import Account
from eth_account.messages import encode_defunct

from config import get_settings


def generate_nonce() -> str:
    return secrets.token_hex(16)


def build_sign_message(wallet: str, nonce: str) -> str:
    return (
        "Welcome to WarrantyVault.\n\n"
        "Sign this message to verify you own this wallet. This request will "
        "not trigger a blockchain transaction or cost any gas fees.\n\n"
        f"Wallet: {wallet}\n"
        f"Nonce: {nonce}"
    )


def verify_wallet_signature(wallet: str, message: str, signature: str) -> bool:
    try:
        encoded_message = encode_defunct(text=message)
        recovered = Account.recover_message(encoded_message, signature=signature)
    except Exception:
        return False
    return recovered.lower() == wallet.lower()


def create_access_token(wallet: str, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": wallet.lower(), "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
