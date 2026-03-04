from pydantic import BaseModel

from models.common import WarrantyStatus


class VerifyRequest(BaseModel):
    warrantyId: int | None = None
    serialNumber: str | None = None


class VerifyResponse(BaseModel):
    status: WarrantyStatus
    warrantyId: int | None = None
    productId: str | None = None
    productName: str | None = None
    ownerWallet: str | None = None
    expiryDate: str | None = None
