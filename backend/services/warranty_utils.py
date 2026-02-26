from datetime import date, datetime, timezone

from models.common import WarrantyStatus


def add_months(start: date, months: int) -> date:
    month_index = start.month - 1 + months
    year = start.year + month_index // 12
    month = month_index % 12 + 1
    day = min(start.day, 28) if month == 2 else start.day
    return date(year, month, day)


def compute_expiry_date(purchase_date_iso: str, warranty_duration_months: int) -> str:
    purchase = date.fromisoformat(purchase_date_iso)
    return add_months(purchase, warranty_duration_months).isoformat()


def compute_offline_status(expiry_date_iso: str) -> WarrantyStatus:
    """Cheap expiry check without an on-chain call, used for list/dashboard
    views. Does not reflect on-chain revocation - callers needing an
    authoritative status (e.g. the /verify endpoint) must read the contract."""
    expiry = datetime.fromisoformat(expiry_date_iso).replace(tzinfo=timezone.utc)
    return WarrantyStatus.ACTIVE if datetime.now(timezone.utc) <= expiry else WarrantyStatus.EXPIRED
