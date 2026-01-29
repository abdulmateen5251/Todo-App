"""MCP tool for updating tasks via conversational interface."""
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, Field, validator

from src.models.task import TaskPriority


class UpdateTaskInput(BaseModel):
    """Input schema for update_task MCP tool."""
    
    task_id: Optional[int] = Field(
        None,
        description="ID of the task to update (optional if current_title is provided)",
        gt=0
    )
    current_title: Optional[str] = Field(
        None,
        description="Current title/name of the task to update (preferred over task_id)"
    )
    title: Optional[str] = Field(
        None,
        description="New task title (max 500 characters)",
        max_length=500
    )
    description: Optional[str] = Field(
        None,
        description="New task description"
    )
    due_date: Optional[str] = Field(
        None,
        description="New due date in ISO 8601 format"
    )
    priority: Optional[str] = Field(
        None,
        description="New priority: low, medium, or high"
    )
    category: Optional[str] = Field(
        None,
        description="New category or tag"
    )
    
    @validator("task_id")
    def validate_task_id(cls, v):
        """Ensure task_id is positive if provided."""
        if v is not None and v <= 0:
            raise ValueError("Task ID must be a positive integer")
        return v
    
    @validator("current_title")
    def validate_identifiers(cls, v, values):
        """Ensure at least one identifier is provided."""
        if v is None and values.get('task_id') is None:
            raise ValueError("Either task_id or current_title must be provided")
        return v
    
    @validator("due_date")
    def validate_due_date(cls, v):
        """Validate ISO 8601 date format."""
        if v is None:
            return None
        
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError(
                "Invalid date format. Use ISO 8601 format like '2024-01-15' or '2024-01-15T14:30:00'"
            )
    
    @validator("priority")
    def validate_priority(cls, v):
        """Validate priority enum value."""
        if v is None:
            return None
        
        valid_priorities = ["low", "medium", "high"]
        if v.lower() not in valid_priorities:
            raise ValueError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return v.lower()
    
    def has_updates(self) -> bool:
        """Check if at least one field is being updated."""
        return any([
            self.title is not None,
            self.description is not None,
            self.due_date is not None,
            self.priority is not None,
            self.category is not None
        ])


def get_update_task_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for update_task tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "update_task",
        "description": "Update properties of an existing task. PREFER using current_title (task name) instead of task_id.",
        "parameters": {
            "type": "object",
            "properties": {
                "current_title": {
                    "type": "string",
                    "description": "The current title/name of the task to update. ALWAYS use this when user says 'update buy groceries' or 'change meeting priority'. This is the PREFERRED way."
                },
                "task_id": {
                    "type": "integer",
                    "description": "The numeric ID (only use if user explicitly mentions a number like 'update task 5')"
                },
                "title": {
                    "type": "string",
                    "description": "New task title (optional, max 500 characters)"
                },
                "description": {
                    "type": "string",
                    "description": "New task description (optional)"
                },
                "due_date": {
                    "type": "string",
                    "description": "New due date in ISO 8601 format like '2024-01-15' (optional)"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "New task priority level (optional)"
                },
                "category": {
                    "type": "string",
                    "description": "New task category or tag (optional)"
                }
            },
            "required": []
        }
    }


async def execute_update_task(
    user_id: int,
    session,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute the update_task MCP tool.
    
    Args:
        user_id: Authenticated user ID
        session: Database session
        **kwargs: Update parameters from AI agent
        
    Returns:
        Result dictionary with success status and updated task details
        
    Raises:
        ValueError: If validation fails or task not found
    """
    from src.services.task_service import task_service
    
    try:
        # Validate input
        input_data = UpdateTaskInput(**kwargs)
        
        # Ensure at least one field is being updated
        if not input_data.has_updates():
            raise ValueError("At least one field must be provided to update")
        
        task_id_to_update = input_data.task_id
        
        # If current_title is provided instead of ID, find the task by title
        if task_id_to_update is None and input_data.current_title:
            # Get all user's tasks
            tasks = await task_service.get_tasks(
                session=session,
                user_id=user_id
            )
            
            search_title = input_data.current_title.lower().strip()
            
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
                    raise ValueError(f"No task found matching '{input_data.current_title}'. Your tasks: {task_names}")
                else:
                    raise ValueError(f"No tasks found. Your task list is empty.")
            
            if len(matching_tasks) > 1:
                task_list = ", ".join([f"'{t.title}'" for t in matching_tasks])
                raise ValueError(f"Multiple tasks found: {task_list}. Please be more specific.")
            
            task_id_to_update = matching_tasks[0].id
        
        # Build updates dictionary
        updates = {}
        
        if input_data.title is not None:
            updates["title"] = input_data.title
        
        if input_data.description is not None:
            updates["description"] = input_data.description
        
        if input_data.due_date is not None:
            updates["due_date"] = datetime.fromisoformat(
                input_data.due_date.replace('Z', '+00:00')
            )
        
        if input_data.priority is not None:
            priority_map = {
                "low": TaskPriority.LOW,
                "medium": TaskPriority.MEDIUM,
                "high": TaskPriority.HIGH
            }
            updates["priority"] = priority_map[input_data.priority]
        
        if input_data.category is not None:
            updates["category"] = input_data.category
        
        # Update task
        task = await task_service.update_task(
            session=session,
            task_id=task_id_to_update,
            user_id=user_id,
            **updates
        )
        
        if task is None:
            raise ValueError(f"Task not found or does not belong to you")
        
        # Build response with updated fields
        updated_fields = list(updates.keys())
        
        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "updated_fields": updated_fields,
            "message": f"✓ Updated {', '.join(updated_fields)} for '{task.title}'"
        }
        
    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise Exception(f"Failed to update task: {str(e)}")
