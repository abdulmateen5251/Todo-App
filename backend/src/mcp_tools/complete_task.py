"""MCP tool for marking tasks as complete via conversational interface."""
from typing import Dict, Any, Optional

from pydantic import BaseModel, Field, validator


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task MCP tool."""
    
    task_id: Optional[int] = Field(
        None,
        description="ID of the task to mark as complete (optional if title is provided)",
        gt=0
    )
    
    title: Optional[str] = Field(
        None,
        description="Title/name of the task to complete (preferred over task_id)"
    )
    
    @validator("task_id")
    def validate_task_id(cls, v):
        """Ensure task_id is positive if provided."""
        if v is not None and v <= 0:
            raise ValueError("Task ID must be a positive integer")
        return v
    
    @validator("title")
    def validate_inputs(cls, v, values):
        """Ensure at least one identifier is provided."""
        if v is None and values.get('task_id') is None:
            raise ValueError("Either task_id or title must be provided")
        return v


def get_complete_task_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for complete_task tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "complete_task",
        "description": "Mark a specific task as completed. PREFER using task title/name instead of ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The title or name of the task to complete. ALWAYS use this when user says 'complete buy groceries' or 'mark meeting as done'. This is the PREFERRED way."
                },
                "task_id": {
                    "type": "integer",
                    "description": "The numeric ID (only use if user explicitly mentions a number like 'complete task 5')"
                }
            },
            "required": []
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
        **kwargs: Task parameters from AI agent (task_id or title)
        
    Returns:
        Result dictionary with success status and task details
        
    Raises:
        ValueError: If validation fails or task not found
    """
    from src.services.task_service import task_service
    
    try:
        # Validate input
        input_data = CompleteTaskInput(**kwargs)
        
        task_id_to_complete = input_data.task_id
        
        # If title is provided instead of ID, find the task by title
        if task_id_to_complete is None and input_data.title:
            # Get all user's tasks
            tasks = await task_service.get_tasks(
                session=session,
                user_id=user_id
            )
            
            search_title = input_data.title.lower().strip()
            
            # First try exact match (case-insensitive)
            matching_tasks = [
                t for t in tasks 
                if t.title.lower().strip() == search_title
            ]
            
            # If no exact match, try partial match
            if not matching_tasks:
                matching_tasks = [
                    t for t in tasks 
                    if search_title in t.title.lower().strip() or t.title.lower().strip() in search_title
                ]
            
            if not matching_tasks:
                if tasks:
                    task_names = ", ".join([f"'{t.title}'" for t in tasks[:5]])
                    raise ValueError(f"No task found matching '{input_data.title}'. Your tasks: {task_names}")
                else:
                    raise ValueError(f"No tasks found. Your task list is empty.")
            
            if len(matching_tasks) > 1:
                task_list = ", ".join([f"'{t.title}'" for t in matching_tasks])
                raise ValueError(f"Multiple tasks found: {task_list}. Please be more specific.")
            
            task_id_to_complete = matching_tasks[0].id
        
        # Mark task complete
        task = await task_service.mark_complete(
            session=session,
            task_id=task_id_to_complete,
            user_id=user_id
        )
        
        if task is None:
            raise ValueError(f"Task not found or does not belong to you")
        
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
