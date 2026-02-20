from pydantic import BaseModel, Field

from models.common import utcnow

COLLECTION = "products"


class ProductModel(BaseModel):
    name: str
    brand: str
    category: str
    model: str
    serialNumber: str
    purchaseDate: str  # ISO date
    warrantyDurationMonths: int
    image: str | None = None
    invoiceCID: str | None = None
    ownerWallet: str
    registeredByWallet: str
    createdAt: str = Field(default_factory=lambda: utcnow().isoformat())
