from datetime import datetime, timezone
from enum import StrEnum


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UserRole(StrEnum):
    MANUFACTURER = "manufacturer"
    RETAILER = "retailer"
    CUSTOMER = "customer"
    SERVICE_CENTER = "service_center"
    ADMIN = "admin"


class WarrantyStatus(StrEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    NOT_FOUND = "not_found"
