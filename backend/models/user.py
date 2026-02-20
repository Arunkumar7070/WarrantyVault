from pydantic import BaseModel, Field

from models.common import UserRole, utcnow

COLLECTION = "users"


class UserModel(BaseModel):
    wallet: str
    name: str | None = None
    email: str | None = None
    role: UserRole = UserRole.CUSTOMER
    nonce: str
    createdAt: str = Field(default_factory=lambda: utcnow().isoformat())
