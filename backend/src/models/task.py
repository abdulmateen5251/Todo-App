"""Task SQLModel entity for PostgreSQL database."""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Task(SQLModel, table=True):
    """Task entity with user scoping."""
    
    __tablename__ = "tasks"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    description: str = Field(max_length=200)
    completed: bool = Field(default=False, index=True)
    due_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "description": "Buy groceries",
                "completed": False,
                "due_date": "2026-01-08T17:30:00Z",
                "created_at": "2026-01-07T10:00:00Z",
                "updated_at": "2026-01-07T10:00:00Z"
            }
        }
