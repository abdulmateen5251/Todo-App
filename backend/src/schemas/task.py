"""Pydantic schemas for Task API endpoints."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from src.models.task import TaskStatus, TaskPriority


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = Field(default=TaskStatus.PENDING)
    priority: Optional[TaskPriority] = None
    category: Optional[str] = Field(None, max_length=100)
    due_date: Optional[datetime] = None
    
    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        """Validate title is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()
    
    @field_validator("description")
    @classmethod
    def description_cleaned(cls, v: Optional[str]) -> Optional[str]:
        """Clean description whitespace."""
        return v.strip() if v else None


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    category: Optional[str] = Field(None, max_length=100)
    due_date: Optional[datetime] = None
    
    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate title is not empty after stripping whitespace."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip() if v else None
    
    @field_validator("description")
    @classmethod
    def description_cleaned(cls, v: Optional[str]) -> Optional[str]:
        """Clean description whitespace."""
        return v.strip() if v else None


class TaskComplete(BaseModel):
    """Schema for toggling task completion."""
    
    completed: bool


class TaskResponse(BaseModel):
    """Schema for task response."""
    
    id: int
    user_id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: Optional[TaskPriority]
    category: Optional[str]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True
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
                "created_at": "2026-01-26T10:00:00Z",
                "updated_at": "2026-01-26T10:00:00Z"
            }
        }


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    
    code: str
    message: str
    details: Optional[dict] = None
