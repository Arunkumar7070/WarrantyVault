from pydantic import BaseModel, Field

from models.common import utcnow

COLLECTION = "transfers"


class TransferModel(BaseModel):
    productId: str
    warrantyId: int
    fromWallet: str
    toWallet: str
    txHash: str
    timestamp: str = Field(default_factory=lambda: utcnow().isoformat())
