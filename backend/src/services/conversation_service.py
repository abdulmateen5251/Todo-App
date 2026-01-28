"""Conversation service for managing chat history."""
from datetime import datetime
from typing import List, Dict, Any
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import desc

from src.models.conversation import ConversationMessage


class ConversationService:
    """Service for conversation history operations."""
    
    async def get_conversation_history(
        self, 
        session: AsyncSession, 
        user_id: int, 
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Fetch most recent N messages for building context.
        
        Args:
            session: Database session
            user_id: User ID to fetch messages for
            limit: Maximum number of messages to retrieve (default: 50)
            
        Returns:
            List of message dictionaries in chronological order
        """
        statement = (
            select(ConversationMessage)
            .where(ConversationMessage.user_id == user_id)
            .order_by(desc(ConversationMessage.created_at))
            .limit(limit)
        )
        
        result = await session.execute(statement)
        messages = result.scalars().all()
        
        # Reverse to get chronological order (oldest first)
        return [
            {"role": msg.role, "content": msg.content}
            for msg in reversed(messages)
        ]
    
    async def save_message(
        self,
        session: AsyncSession,
        user_id: UUID,
        role: str,
        content: str,
        tool_calls: str | None = None,
        tool_results: str | None = None
    ) -> ConversationMessage:
        """
        Store a message in the database.
        
        Args:
            session: Database session
            user_id: User ID who owns this message
            role: Speaker role (user or assistant)
            content: Message text
            tool_calls: JSON string of tool invocations (optional)
            tool_results: JSON string of tool outputs (optional)
            
        Returns:
            Created ConversationMessage instance
        """
        message = ConversationMessage(
            id=uuid4(),
            user_id=user_id,
            role=role,
            content=content,
            tool_calls=tool_calls,
            tool_results=tool_results,
            created_at=datetime.utcnow()
        )
        
        session.add(message)
        await session.commit()
        await session.refresh(message)
        
        return message


# Singleton instance
conversation_service = ConversationService()
