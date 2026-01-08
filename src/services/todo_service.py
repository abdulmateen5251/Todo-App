"""
TodoService - Business logic for todo management.

This module provides CRUD operations for managing todos in memory.
"""
from typing import Dict, List
from src.models.todo import Todo


class TodoService:
    """
    Service layer for todo operations.
    
    Manages in-memory storage of todos using a dictionary and provides
    CRUD operations with validation.
    
    Attributes:
        _todos: Dictionary mapping todo IDs to Todo objects
        _next_id: Counter for auto-incrementing IDs
    """
    
    def __init__(self) -> None:
        """Initialize the TodoService with empty storage."""
        self._todos: Dict[int, Todo] = {}
        self._next_id: int = 1
    
    @staticmethod
    def _validate_description(description: str) -> str:
        """
        Validate and sanitize todo description.
        
        Args:
            description: The description string to validate
            
        Returns:
            Sanitized description (stripped of whitespace)
            
        Raises:
            ValueError: If description is empty or exceeds 200 characters
        """
        # Strip whitespace
        clean_desc = description.strip()
        
        # Check if empty
        if not clean_desc:
            raise ValueError("Description cannot be empty.")
        
        # Check length
        if len(clean_desc) > 200:
            raise ValueError(
                f"Description too long (max 200 characters). Current length: {len(clean_desc)}"
            )
        
        return clean_desc
    
    def add_todo(self, description: str) -> Todo:
        """
        Create a new todo with the given description.
        
        Args:
            description: Task description (1-200 characters)
            
        Returns:
            Newly created Todo object with auto-assigned ID
            
        Raises:
            ValueError: If description is empty or exceeds 200 characters
        """
        clean_desc = self._validate_description(description)
        
        # Create new todo
        todo = Todo(
            id=self._next_id,
            description=clean_desc,
            completed=False
        )
        
        # Store and increment ID
        self._todos[self._next_id] = todo
        self._next_id += 1
        
        return todo
    
    def get_all_todos(self) -> List[Todo]:
        """
        Retrieve all todos in the collection.
        
        Returns:
            List of all Todo objects, ordered by ID (ascending)
        """
        return sorted(self._todos.values(), key=lambda t: t.id)
    
    def get_counts(self) -> Dict[str, int]:
        """
        Get summary statistics about todos.
        
        Returns:
            Dictionary with keys 'total', 'pending', 'completed'
        """
        total = len(self._todos)
        completed = sum(1 for todo in self._todos.values() if todo.completed)
        pending = total - completed
        
        return {
            "total": total,
            "pending": pending,
            "completed": completed
        }
    
    def get_todo(self, todo_id: int) -> Todo:
        """
        Retrieve a specific todo by its ID.
        
        Args:
            todo_id: The unique identifier of the todo
            
        Returns:
            Todo object with matching ID
            
        Raises:
            KeyError: If todo with given ID does not exist
        """
        if todo_id not in self._todos:
            raise KeyError(f"Todo #{todo_id} not found.")
        
        return self._todos[todo_id]
    
    def mark_complete(self, todo_id: int) -> Todo:
        """
        Mark a todo as completed.
        
        Args:
            todo_id: The unique identifier of the todo
            
        Returns:
            Updated Todo object with completed=True
            
        Raises:
            KeyError: If todo with given ID does not exist
        """
        todo = self.get_todo(todo_id)
        todo.completed = True
        return todo
    
    def update_todo(self, todo_id: int, new_description: str) -> Todo:
        """
        Update the description of an existing todo.
        
        Args:
            todo_id: The unique identifier of the todo
            new_description: New task description (1-200 characters)
            
        Returns:
            Updated Todo object
            
        Raises:
            KeyError: If todo with given ID does not exist
            ValueError: If new description is empty or exceeds 200 characters
        """
        # Validate new description
        clean_desc = self._validate_description(new_description)
        
        # Get todo and update
        todo = self.get_todo(todo_id)
        todo.description = clean_desc
        
        return todo
    
    def delete_todo(self, todo_id: int) -> None:
        """
        Permanently remove a todo from the collection.
        
        Args:
            todo_id: The unique identifier of the todo
            
        Raises:
            KeyError: If todo with given ID does not exist
        """
        # Check if todo exists
        if todo_id not in self._todos:
            raise KeyError(f"Todo #{todo_id} not found.")
        
        # Delete the todo
        del self._todos[todo_id]
    
    def get_todos_by_status(self, completed: bool) -> List[Todo]:
        """
        Retrieve todos filtered by completion status.
        
        Args:
            completed: True for completed todos, False for pending
            
        Returns:
            List of Todo objects matching the status, ordered by ID
        """
        filtered = [todo for todo in self._todos.values() if todo.completed == completed]
        return sorted(filtered, key=lambda t: t.id)

