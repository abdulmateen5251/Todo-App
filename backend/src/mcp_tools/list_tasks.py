"""MCP tool for listing tasks via conversational interface."""
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field, validator

from src.models.task import TaskStatus, TaskPriority


class ListTasksInput(BaseModel):
    """Input schema for list_tasks MCP tool."""
    
    status: Optional[str] = Field(
        None,
        description="Filter by status: all, pending, or completed (default: all)"
    )
    category: Optional[str] = Field(
        None,
        description="Filter by specific category"
    )
    priority: Optional[str] = Field(
        None,
        description="Filter by priority: low, medium, or high"
    )
    
    @validator("status")
    def validate_status(cls, v):
        """Validate status filter value."""
        if v is None or v == "all":
            return None
        
        valid_statuses = ["pending", "completed"]
        if v.lower() not in valid_statuses:
            raise ValueError(f"Status must be one of: all, {', '.join(valid_statuses)}")
        return v.lower()
    
    @validator("priority")
    def validate_priority(cls, v):
        """Validate priority filter value."""
        if v is None:
            return None
        
        valid_priorities = ["low", "medium", "high"]
        if v.lower() not in valid_priorities:
            raise ValueError(f"Priority must be one of: {', '.join(valid_priorities)}")
        return v.lower()


def get_list_tasks_schema() -> Dict[str, Any]:
    """
    Get OpenAI function schema for list_tasks tool.
    
    Returns:
        Function schema dictionary for OpenAI API
    """
    return {
        "name": "list_tasks",
        "description": "Retrieve and list tasks with optional filtering by status, category, or priority",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "Filter tasks by status (default: all)"
                },
                "category": {
                    "type": "string",
                    "description": "Filter tasks by specific category"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Filter tasks by priority level"
                }
            },
            "required": []
        }
    }


async def execute_list_tasks(
    user_id: int,
    session,
    **kwargs
) -> Dict[str, Any]:
    """
    Execute the list_tasks MCP tool.
    
    Args:
        user_id: Authenticated user ID
        session: Database session
        **kwargs: Filter parameters from AI agent
        
    Returns:
        Result dictionary with task count and list of tasks
        
    Raises:
        ValueError: If validation fails
    """
    from src.services.task_service import task_service
    
    try:
        # Validate input
        input_data = ListTasksInput(**kwargs)
        
        # Map string values to enums
        status = None
        if input_data.status == "pending":
            status = TaskStatus.PENDING
        elif input_data.status == "completed":
            status = TaskStatus.COMPLETED
        
        priority = None
        if input_data.priority:
            priority_map = {
                "low": TaskPriority.LOW,
                "medium": TaskPriority.MEDIUM,
                "high": TaskPriority.HIGH
            }
            priority = priority_map[input_data.priority]
        
        # Retrieve tasks
        tasks = await task_service.get_tasks(
            session=session,
            user_id=user_id,
            status=status,
            category=input_data.category,
            priority=priority
        )
        
        # Format task list
        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value if hasattr(task.status, 'value') else task.status,
                "priority": task.priority.value if hasattr(task.priority, 'value') else task.priority,
                "category": task.category,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                "created_at": task.created_at.isoformat()
            }
            for task in tasks
        ]
        
        return {
            "success": True,
            "count": len(task_list),
            "tasks": task_list,
            "message": f"Found {len(task_list)} task{'s' if len(task_list) != 1 else ''}"
        }
        
    except ValueError as e:
        raise ValueError(f"Invalid filter: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to retrieve tasks: {str(e)}")
