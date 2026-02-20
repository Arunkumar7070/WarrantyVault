from pydantic import BaseModel, Field

from models.common import WarrantyStatus, utcnow

COLLECTION = "warranties"


class WarrantyModel(BaseModel):
    productId: str
    ownerWallet: str
    purchaseDate: str  # ISO date
    expiryDate: str  # ISO date
    contractAddress: str
    warrantyId: int  # on-chain warranty id from WarrantyRegistry
    txHash: str
    status: WarrantyStatus = WarrantyStatus.ACTIVE
    createdAt: str = Field(default_factory=lambda: utcnow().isoformat())
