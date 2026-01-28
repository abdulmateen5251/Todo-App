"""User schemas for API requests and responses."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    name: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response."""
    id: UUID
    email: str
    name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Schema for login response with JWT token."""
    id: UUID
    email: str
    name: Optional[str] = None
    created_at: datetime
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True
