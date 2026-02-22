from fastapi import APIRouter, Query

from schemas.auth import LoginRequest, LoginResponse, NonceResponse
from services.user_service import get_nonce, login

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/nonce", response_model=NonceResponse)
async def request_nonce(wallet: str = Query(..., min_length=42, max_length=42)):
    return await get_nonce(wallet)


@router.post("/login", response_model=LoginResponse)
async def login_with_wallet(payload: LoginRequest):
    return await login(payload.wallet, payload.signature)
