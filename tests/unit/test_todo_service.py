"""
Basic unit tests for Todo Application.

Run with: python3 -m pytest tests/
"""
import pytest
from src.models.todo import Todo
from src.services.todo_service import TodoService


class TestTodoModel:
    """Tests for Todo dataclass."""
    
    def test_todo_creation(self):
        """Test creating a todo."""
        todo = Todo(id=1, description="Test task")
        assert todo.id == 1
        assert todo.description == "Test task"
        assert todo.completed is False
    
    def test_todo_repr(self):
        """Test todo string representation."""
        todo = Todo(id=1, description="Test", completed=False)
        assert "[ ]" in repr(todo)
        
        todo.completed = True
        assert "[✓]" in repr(todo)


class TestTodoService:
    """Tests for TodoService."""
    
    def test_add_todo(self):
        """Test adding a todo."""
        service = TodoService()
        todo = service.add_todo("Test task")
        
        assert todo.id == 1
        assert todo.description == "Test task"
        assert todo.completed is False
    
    def test_add_todo_strips_whitespace(self):
        """Test that whitespace is stripped from description."""
        service = TodoService()
        todo = service.add_todo("  Test task  ")
        assert todo.description == "Test task"
    
    def test_add_todo_empty_raises_error(self):
        """Test that empty description raises ValueError."""
        service = TodoService()
        with pytest.raises(ValueError, match="cannot be empty"):
            service.add_todo("")
    
    def test_add_todo_too_long_raises_error(self):
        """Test that description > 200 chars raises ValueError."""
        service = TodoService()
        with pytest.raises(ValueError, match="too long"):
            service.add_todo("a" * 201)
    
    def test_get_all_todos(self):
        """Test retrieving all todos."""
        service = TodoService()
        service.add_todo("Task 1")
        service.add_todo("Task 2")
        
        todos = service.get_all_todos()
        assert len(todos) == 2
        assert todos[0].description == "Task 1"
        assert todos[1].description == "Task 2"
    
    def test_get_all_todos_empty(self):
        """Test retrieving todos from empty list."""
        service = TodoService()
        todos = service.get_all_todos()
        assert todos == []
    
    def test_get_todo(self):
        """Test retrieving a specific todo."""
        service = TodoService()
        todo = service.add_todo("Test")
        retrieved = service.get_todo(todo.id)
        assert retrieved.id == todo.id
        assert retrieved.description == todo.description
    
    def test_get_todo_not_found(self):
        """Test getting non-existent todo raises KeyError."""
        service = TodoService()
        with pytest.raises(KeyError, match="not found"):
            service.get_todo(999)
    
    def test_mark_complete(self):
        """Test marking a todo as complete."""
        service = TodoService()
        todo = service.add_todo("Test")
        
        completed = service.mark_complete(todo.id)
        assert completed.completed is True
    
    def test_mark_complete_idempotent(self):
        """Test marking already complete todo is idempotent."""
        service = TodoService()
        todo = service.add_todo("Test")
        
        service.mark_complete(todo.id)
        service.mark_complete(todo.id)  # Should not raise error
        assert todo.completed is True
    
    def test_update_todo(self):
        """Test updating todo description."""
        service = TodoService()
        todo = service.add_todo("Original")
        
        updated = service.update_todo(todo.id, "Updated")
        assert updated.description == "Updated"
        assert updated.id == todo.id
        assert updated.completed == todo.completed
    
    def test_update_preserves_completed_status(self):
        """Test update preserves completion status."""
        service = TodoService()
        todo = service.add_todo("Test")
        service.mark_complete(todo.id)
        
        service.update_todo(todo.id, "Updated")
        assert todo.completed is True
    
    def test_delete_todo(self):
        """Test deleting a todo."""
        service = TodoService()
        todo = service.add_todo("Test")
        
        service.delete_todo(todo.id)
        
        with pytest.raises(KeyError):
            service.get_todo(todo.id)
    
    def test_delete_preserves_other_ids(self):
        """Test deletion doesn't renumber IDs."""
        service = TodoService()
        todo1 = service.add_todo("Task 1")
        todo2 = service.add_todo("Task 2")
        todo3 = service.add_todo("Task 3")
        
        service.delete_todo(todo2.id)
        
        remaining = service.get_all_todos()
        assert len(remaining) == 2
        assert remaining[0].id == 1
        assert remaining[1].id == 3
    
    def test_get_counts(self):
        """Test todo counts."""
        service = TodoService()
        service.add_todo("Task 1")
        service.add_todo("Task 2")
        todo3 = service.add_todo("Task 3")
        service.mark_complete(todo3.id)
        
        counts = service.get_counts()
        assert counts["total"] == 3
        assert counts["pending"] == 2
        assert counts["completed"] == 1
    
    def test_get_todos_by_status(self):
        """Test filtering todos by status."""
        service = TodoService()
        todo1 = service.add_todo("Task 1")
        service.add_todo("Task 2")
        todo3 = service.add_todo("Task 3")
        
        service.mark_complete(todo1.id)
        service.mark_complete(todo3.id)
        
        completed = service.get_todos_by_status(completed=True)
        pending = service.get_todos_by_status(completed=False)
        
        assert len(completed) == 2
        assert len(pending) == 1
        assert pending[0].description == "Task 2"
    
    def test_unicode_support(self):
        """Test Unicode characters in descriptions."""
        service = TodoService()
        todo = service.add_todo("Unicode test: 你好 🎉 café")
        assert todo.description == "Unicode test: 你好 🎉 café"
