"""Pydantic schemas for Task API endpoints."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    
    description: str = Field(min_length=1, max_length=200)
    due_date: Optional[datetime] = None
    
    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        """Validate description is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip()


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    due_date: Optional[datetime] = None
    
    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate description is not empty after stripping whitespace."""
        if v is not None and not v.strip():
            raise ValueError("Description cannot be empty")
        return v.strip() if v else None


class TaskComplete(BaseModel):
    """Schema for toggling task completion."""
    
    completed: bool


class TaskResponse(BaseModel):
    """Schema for task response."""
    
    id: UUID
    user_id: UUID
    description: str
    completed: bool
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic configuration."""
        from_attributes = True
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


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    
    code: str
    message: str
    details: Optional[dict] = None
