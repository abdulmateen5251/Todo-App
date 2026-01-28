"""User SQLModel entity for PostgreSQL database."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User entity for the Todo application."""
    
    __tablename__ = "users"
    
    id: UUID = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "alice@example.com",
                "name": "Alice Smith",
                "created_at": "2026-01-26T10:00:00Z",
                "updated_at": "2026-01-26T10:00:00Z"
            }
        }
