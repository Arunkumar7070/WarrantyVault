from pydantic import BaseModel, Field

from models.common import utcnow

COLLECTION = "notifications"


class NotificationModel(BaseModel):
    userWallet: str
    type: str
    message: str
    read: bool = False
    createdAt: str = Field(default_factory=lambda: utcnow().isoformat())
