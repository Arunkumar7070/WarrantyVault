from pydantic import BaseModel

from models.common import UserRole


class NonceResponse(BaseModel):
    wallet: str
    message: str


class LoginRequest(BaseModel):
    wallet: str
    signature: str


class UserProfile(BaseModel):
    wallet: str
    name: str | None
    email: str | None
    role: UserRole
    createdAt: str


class LoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserProfile


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    email: str | None = None
