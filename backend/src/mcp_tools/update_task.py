"""MCP tool for updating tasks via conversational interface."""
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, Field, validator

from src.models.task import TaskPriority


class UpdateTaskInput(BaseModel):
    """Input schema for update_task MCP tool."""
    
    task_id: int = Field(
        ...,
        description="ID of the task to update",
        gt=0
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
        """Ensure task_id is positive."""
        if v <= 0:
            raise ValueError("Task ID must be a positive integer")
        return v
    
    @validator("title")
    def validate_title(cls, v):
        """Ensure title is not empty if provided."""
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip() if v else None
    
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
        "description": "Update properties of an existing task (title, description, priority, category, or due date)",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The unique ID of the task to update"
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
            "required": ["task_id"]
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
            task_id=input_data.task_id,
            user_id=user_id,
            **updates
        )
        
        if task is None:
            raise ValueError(f"Task with ID {input_data.task_id} not found or does not belong to you")
        
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
