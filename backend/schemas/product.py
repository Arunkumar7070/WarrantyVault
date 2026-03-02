from datetime import date, timedelta

from pydantic import BaseModel, Field, field_validator

from models.common import WarrantyStatus

MIN_PURCHASE_DATE = date(2000, 1, 1)


class ProductCreateRequest(BaseModel):
    id: str  # 24-character hex string (ObjectId)
    name: str
    brand: str
    category: str
    model: str
    serialNumber: str
    purchaseDate: str  # ISO date, e.g. "2026-01-15"
    warrantyDurationMonths: int = Field(gt=0, le=600)
    image: str | None = None
    invoiceCID: str | None = None
    ownerWallet: str | None = None  # manufacturer/retailer may register on behalf of a customer
    txHash: str  # hash of the on-chain registerWarranty tx, signed & sent by the owner's wallet

    @field_validator("purchaseDate")
    @classmethod
    def validate_purchase_date(cls, value: str) -> str:
        try:
            parsed = date.fromisoformat(value)
        except ValueError:
            raise ValueError("purchaseDate must be a valid ISO date (YYYY-MM-DD)")
        if parsed < MIN_PURCHASE_DATE:
            raise ValueError(f"purchaseDate must be on or after {MIN_PURCHASE_DATE.isoformat()}")
        if parsed > date.today() + timedelta(days=1):
            raise ValueError("purchaseDate cannot be in the future")
        return value


class WarrantySummary(BaseModel):
    warrantyId: int
    contractAddress: str
    txHash: str
    expiryDate: str
    status: WarrantyStatus


class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    model: str
    serialNumber: str
    purchaseDate: str
    warrantyDurationMonths: int
    image: str | None
    invoiceCID: str | None
    ownerWallet: str
    registeredByWallet: str
    createdAt: str
    warranty: WarrantySummary | None = None


class TransferRequest(BaseModel):
    toWallet: str
    txHash: str  # hash of the on-chain transferWarranty tx, already signed & sent by the owner's wallet


class TransferResponse(BaseModel):
    id: str
    productId: str
    warrantyId: int
    fromWallet: str
    toWallet: str
    txHash: str
    timestamp: str
