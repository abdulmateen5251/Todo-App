"""Unit tests for Task model."""
import pytest
from datetime import datetime
from uuid import uuid4

from src.models.task import Task


def test_task_creation():
    """Test Task model creation."""
    user_id = uuid4()
    task = Task(
        user_id=user_id,
        description="Buy groceries",
        completed=False
    )
    
    assert task.description == "Buy groceries"
    assert task.completed is False
    assert task.user_id == user_id
    assert task.id is not None
    assert isinstance(task.created_at, datetime)
    assert isinstance(task.updated_at, datetime)


def test_task_with_due_date():
    """Test Task model with due date."""
    user_id = uuid4()
    due_date = datetime(2026, 1, 8, 17, 30, 0)
    
    task = Task(
        user_id=user_id,
        description="Complete report",
        due_date=due_date
    )
    
    assert task.due_date == due_date
    assert task.description == "Complete report"
