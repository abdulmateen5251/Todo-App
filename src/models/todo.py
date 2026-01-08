"""
Todo data model.

This module defines the Todo dataclass representing a single task.
"""
from dataclasses import dataclass


@dataclass
class Todo:
    """
    Represents a single todo item.
    
    Attributes:
        id: Unique identifier (auto-assigned, immutable)
        description: Task description (1-200 characters)
        completed: Completion status (True = done, False = pending)
    """
    id: int
    description: str
    completed: bool = False
    
    def __repr__(self) -> str:
        """String representation showing status and description."""
        status = "✓" if self.completed else " "
        return f"Todo(id={self.id}, [{status}] {self.description})"
