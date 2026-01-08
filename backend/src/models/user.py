"""User SQLModel entity for PostgreSQL database."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User entity managed by Better Auth."""
    
    __tablename__ = "users"
    
    id: UUID = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "name": "Alice",
                "created_at": "2026-01-07T10:00:00Z"
            }
        }
