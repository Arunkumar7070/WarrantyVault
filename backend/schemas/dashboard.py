from pydantic import BaseModel

from schemas.product import ProductResponse


class DashboardStats(BaseModel):
    totalProducts: int
    activeWarranties: int
    expiredWarranties: int
    recentProducts: list[ProductResponse]
