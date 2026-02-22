from fastapi import APIRouter, Depends

from auth.dependencies import CurrentUser, get_current_user
from schemas.auth import UpdateProfileRequest, UserProfile
from services.user_service import get_profile, update_profile

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/profile", response_model=UserProfile)
async def read_profile(current_user: CurrentUser = Depends(get_current_user)):
    return await get_profile(current_user.wallet)


@router.put("/profile", response_model=UserProfile)
async def edit_profile(payload: UpdateProfileRequest, current_user: CurrentUser = Depends(get_current_user)):
    return await update_profile(current_user.wallet, payload.name, payload.email)
