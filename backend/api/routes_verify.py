from fastapi import APIRouter

from schemas.verify import VerifyRequest, VerifyResponse
from services.verify_service import verify_warranty

router = APIRouter(tags=["verify"])


@router.post("/verify", response_model=VerifyResponse)
async def verify(payload: VerifyRequest):
    return await verify_warranty(payload)
