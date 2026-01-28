"""MCP tool for deleting tasks via conversational interface."""
from typing import Dict, Any

from pydantic import BaseModel, Field, validator


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task MCP tool."""
    
    task_id: int = Field(
        ...,
        description="ID of the task to delete",
        gt=0
    )
    
    @validator("task_id")
    def validate_task_id(cls, v):
        """Ensure task_id is positive."""
        if v <= 0:
            raise ValueError("Task ID must be a positive integer")
        return v


def get_delete_task_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for delete_task tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "delete_task",
        "description": "Permanently delete a task from the system",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The unique ID of the task to delete"
                }
            },
            "required": ["task_id"]
        }
    }


async def execute_delete_task(
    user_id: int,
    session,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute the delete_task MCP tool.
    
    Args:
        user_id: Authenticated user ID
        session: Database session
        **kwargs: Task parameters from AI agent
        
    Returns:
        Result dictionary with success status
        
    Raises:
        ValueError: If validation fails or task not found
    """
    from src.services.task_service import task_service
    
    try:
        # Validate input
        input_data = DeleteTaskInput(**kwargs)
        
        # Delete task (includes ownership verification)
        success = await task_service.delete_task(
            session=session,
            task_id=input_data.task_id,
            user_id=user_id
        )
        
        if not success:
            raise ValueError(f"Task with ID {input_data.task_id} not found or does not belong to you")
        
        return {
            "success": True,
            "task_id": input_data.task_id,
            "message": f"✓ Deleted task {input_data.task_id}"
        }
        
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise Exception(f"Failed to delete task: {str(e)}")
