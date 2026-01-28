"""MCP tool for adding tasks via conversational interface."""
from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, Field, validator

from src.models.task import TaskPriority


class AddTaskInput(BaseModel):
    """Input schema for add_task MCP tool."""
    
    title: str = Field(
        ...,
        description="Task title (required, max 500 characters)",
        max_length=500,
        min_length=1
    )
    description: Optional[str] = Field(
        None,
        description="Detailed task description"
    )
    due_date: Optional[str] = Field(
        None,
        description="Due date in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"
    )
    priority: str = Field(
        "medium",
        description="Task priority: low, medium, or high"
    )
    category: Optional[str] = Field(
        None,
        description="Task category or tag for organization"
    )
    
    @validator("title")
    def validate_title(cls, v):
        """Ensure title is not empty or whitespace."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()
    
    @validator("due_date")
    def validate_due_date(cls, v):
        """Validate ISO 8601 date format."""
        if v is None:
            return None
        
        try:
            # Try parsing ISO 8601 formats
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError(
                "Invalid date format. Use ISO 8601 format like '2024-01-15' or '2024-01-15T14:30:00'"
            )
    
    @validator("priority")
    def validate_priority(cls, v):
        """Validate priority enum value."""
        valid_priorities = ["low", "medium", "high"]
        if v.lower() not in valid_priorities:
            raise ValueError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return v.lower()


def get_add_task_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for add_task tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "add_task",
        "description": "Create a new task for the user with specified details",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Task title (required, max 500 characters)"
                },
                "description": {
                    "type": "string",
                    "description": "Detailed task description (optional)"
                },
                "due_date": {
                    "type": "string",
                    "description": "Due date in ISO 8601 format like '2024-01-15' or '2024-01-15T14:30:00' (optional)"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Task priority level (default: medium)"
                },
                "category": {
                    "type": "string",
                    "description": "Task category or tag for organization (optional)"
                }
            },
            "required": ["title"]
        }
    }


async def execute_add_task(
    user_id: int,
    session,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute the add_task MCP tool.
    
    Args:
        user_id: Authenticated user ID
        session: Database session
        **kwargs: Task parameters from AI agent
        
    Returns:
        Result dictionary with success status and task details
        
    Raises:
        ValueError: If validation fails
    """
    from src.services.task_service import task_service
    from src.models.task import TaskPriority
    
    try:
        # Validate input
        input_data = AddTaskInput(**kwargs)
        
        # Parse due date if provided
        due_date = None
        if input_data.due_date:
            due_date = datetime.fromisoformat(
                input_data.due_date.replace('Z', '+00:00')
            )
        
        # Map priority string to enum
        priority_map = {
            "low": TaskPriority.LOW,
            "medium": TaskPriority.MEDIUM,
            "high": TaskPriority.HIGH
        }
        priority = priority_map[input_data.priority]
        
        # Create task
        task = await task_service.create_task(
            session=session,
            user_id=user_id,
            title=input_data.title,
            description=input_data.description,
            priority=priority,
            category=input_data.category,
            due_date=due_date
        )
        
        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "priority": task.priority.value if hasattr(task.priority, 'value') else task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "message": f"✓ Created task '{task.title}'"
        }
        
    except ValueError as e:
        raise ValueError(f"Invalid input: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to create task: {str(e)}")
