"""Task SQLModel entity for PostgreSQL database."""
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class TaskStatus(str, Enum):
    """Task completion status."""
    PENDING = "pending"
    COMPLETED = "completed"


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(SQLModel, table=True):
    """Task entity with user scoping."""
    
    __tablename__ = "tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    status: TaskStatus = Field(default=TaskStatus.PENDING, sa_column=Column(String(50)))
    priority: Optional[TaskPriority] = Field(default=None, sa_column=Column(String(50)))
    category: Optional[str] = Field(default=None, max_length=100)
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": 42,
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread, and coffee beans",
                "status": "pending",
                "priority": "medium",
                "category": "personal",
                "due_date": "2026-01-27T18:00:00Z",
                "completed_at": None,
                "created_at": "2026-01-26T10:15:00Z",
                "updated_at": "2026-01-26T10:15:00Z"
            }
        }
