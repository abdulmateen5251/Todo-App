"""MCP tool for deleting tasks via conversational interface."""
from typing import Dict, Any, Optional

from pydantic import BaseModel, Field, validator


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task MCP tool."""
    
    task_id: Optional[int] = Field(
        None,
        description="ID of the task to delete (optional if title is provided)",
        gt=0
    )
    
    title: Optional[str] = Field(
        None,
        description="Title/name of the task to delete (optional if task_id is provided)"
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


def get_delete_task_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for delete_task tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "delete_task",
        "description": "Permanently delete a task from the system. PREFER using the task title/name to delete. Only use task_id if user explicitly provides a number ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The title or name of the task to delete. ALWAYS use this when user mentions a task by name like 'delete buy groceries' or 'remove my meeting task'. This is the PREFERRED way to delete tasks."
                },
                "task_id": {
                    "type": "integer",
                    "description": "The numeric ID of the task (only use if user explicitly says a number like 'delete task 5' or 'delete task #3')"
                }
            },
            "required": []
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
        **kwargs: Task parameters from AI agent (task_id or title)
        
    Returns:
        Result dictionary with success status
        
    Raises:
        ValueError: If validation fails or task not found
    """
    from src.services.task_service import task_service
    
    try:
        # Validate input
        input_data = DeleteTaskInput(**kwargs)
        
        task_id_to_delete = input_data.task_id
        
        # If title is provided instead of ID, find the task by title
        if task_id_to_delete is None and input_data.title:
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
            
            # If no exact match, try partial match (title contains search term)
            if not matching_tasks:
                matching_tasks = [
                    t for t in tasks 
                    if search_title in t.title.lower().strip() or t.title.lower().strip() in search_title
                ]
            
            if not matching_tasks:
                # List available tasks to help user
                if tasks:
                    task_names = ", ".join([f"'{t.title}'" for t in tasks[:5]])
                    raise ValueError(f"No task found matching '{input_data.title}'. Your tasks: {task_names}")
                else:
                    raise ValueError(f"No tasks found. Your task list is empty.")
            
            if len(matching_tasks) > 1:
                # Multiple matches - return list for user to choose
                task_list = ", ".join([f"'{t.title}' (ID: {t.id})" for t in matching_tasks])
                raise ValueError(
                    f"Multiple tasks found with similar title. Please specify:\n{task_list}"
                )
            
            task_id_to_delete = matching_tasks[0].id
        
        # Delete task (includes ownership verification)
        success = await task_service.delete_task(
            session=session,
            task_id=task_id_to_delete,
            user_id=user_id
        )
        
        if not success:
            raise ValueError(f"Task not found or does not belong to you")
        
        title_msg = f" '{input_data.title}'" if input_data.title else ""
        return {
            "success": True,
            "task_id": task_id_to_delete,
            "message": f"✓ Deleted task{title_msg}"
        }
        
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise Exception(f"Failed to delete task: {str(e)}")
