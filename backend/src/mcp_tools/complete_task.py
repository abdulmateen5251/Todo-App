"""MCP tool for marking tasks as complete via conversational interface."""
from typing import Dict, Any

from pydantic import BaseModel, Field, validator


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task MCP tool."""
    
    task_id: int = Field(
        ...,
        description="ID of the task to mark as complete",
        gt=0
    )
    
    @validator("task_id")
    def validate_task_id(cls, v):
        """Ensure task_id is positive."""
        if v <= 0:
            raise ValueError("Task ID must be a positive integer")
        return v


def get_complete_task_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for complete_task tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "complete_task",
        "description": "Mark a specific task as completed",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The unique ID of the task to complete"
                }
            },
            "required": ["task_id"]
        }
    }


async def execute_complete_task(
    user_id: int,
    session,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute the complete_task MCP tool.
    
    Args:
        user_id: Authenticated user ID
        session: Database session
        **kwargs: Task parameters from AI agent
        
    Returns:
        Result dictionary with success status and task details
        
    Raises:
        ValueError: If validation fails or task not found
    """
    from src.services.task_service import task_service
    
    try:
        # Validate input
        input_data = CompleteTaskInput(**kwargs)
        
        # Mark task complete
        task = await task_service.mark_complete(
            session=session,
            task_id=input_data.task_id,
            user_id=user_id
        )
        
        if task is None:
            raise ValueError(f"Task with ID {input_data.task_id} not found or does not belong to you")
        
        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "message": f"✓ Marked '{task.title}' as complete"
        }
        
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise Exception(f"Failed to complete task: {str(e)}")
