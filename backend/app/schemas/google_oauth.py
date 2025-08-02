from pydantic import BaseModel, EmailStr
from typing import Optional

class GoogleOAuthRequest(BaseModel):
    """Request model for Google OAuth credential"""
    credential: str

class UserResponse(BaseModel):
    """User response model"""
    id: str
    name: str
    email: EmailStr
    company: Optional[str] = None
    google_id: str
    role: str = "user"
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    """Authentication response model"""
    success: bool
    token: str
    user: UserResponse

class TokenData(BaseModel):
    """Token payload data"""
    sub: Optional[str] = None
    email: Optional[str] = None