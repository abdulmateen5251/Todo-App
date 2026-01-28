"""ConversationMessage SQLModel entity for storing chat history."""
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID

from sqlmodel import Field, SQLModel


class ConversationMessage(SQLModel, table=True):
    """Conversation message for stateless request processing."""
    
    __tablename__ = "conversation_messages"
    
    id: UUID = Field(primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    role: str = Field(max_length=50)  # "user" or "assistant"
    content: str = Field(max_length=10000)
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    tool_results: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "user",
                "content": "Create a task to buy groceries",
                "tool_calls": None,
                "tool_results": None,
                "created_at": "2026-01-26T10:15:00Z"
            }
        }
