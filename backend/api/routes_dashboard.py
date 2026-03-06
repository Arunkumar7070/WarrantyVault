from fastapi import APIRouter, Depends

from auth.dependencies import CurrentUser, get_current_user
from schemas.dashboard import DashboardStats
from services.dashboard_service import get_dashboard_stats

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(current_user: CurrentUser = Depends(get_current_user)):
    return await get_dashboard_stats(current_user)
