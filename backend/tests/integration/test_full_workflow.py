"""Integration tests for full task workflow."""
import pytest
from uuid import uuid4
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session

from src.main import app
from src.models.task import Task
from src.models.user import User


def test_full_task_lifecycle(client: TestClient, session: Session):
    """
    Test complete task lifecycle:
    1. Create user
    2. Create task
    3. List tasks
    4. Update task
    5. Toggle completion
    6. Delete task
    """
    # 1. Create user
    user_id = uuid4()
    user = User(id=user_id, email="lifecycle@example.com", name="Lifecycle User")
    session.add(user)
    session.commit()
    
    # 2. Create task
    task_data = {
        "description": "Complete lifecycle test",
        "due_date": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    response = client.post(f"/api/{user_id}/tasks", json=task_data)
    assert response.status_code == 201
    task = response.json()
    task_id = task["id"]
    assert task["description"] == "Complete lifecycle test"
    assert task["completed"] is False
    
    # 3. List tasks
    response = client.get(f"/api/{user_id}/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["id"] == task_id
    
    # 4. Update task
    update_data = {"description": "Updated lifecycle test"}
    response = client.put(f"/api/{user_id}/tasks/{task_id}", json=update_data)
    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["description"] == "Updated lifecycle test"
    
    # 5. Toggle completion
    response = client.patch(f"/api/{user_id}/tasks/{task_id}/complete")
    assert response.status_code == 200
    completed_task = response.json()
    assert completed_task["completed"] is True
    
    # 6. Delete task
    response = client.delete(f"/api/{user_id}/tasks/{task_id}")
    assert response.status_code == 204
    
    # 7. Verify deletion
    response = client.get(f"/api/{user_id}/tasks")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_multiple_users_isolation(client: TestClient, session: Session):
    """Test that multiple users have isolated task lists."""
    # Create two users
    user1_id = uuid4()
    user2_id = uuid4()
    
    user1 = User(id=user1_id, email="user1@isolation.com", name="User 1")
    user2 = User(id=user2_id, email="user2@isolation.com", name="User 2")
    session.add_all([user1, user2])
    session.commit()
    
    # Create tasks for each user directly in DB
    task1 = Task(user_id=user1_id, description="User 1 task", completed=False)
    task2 = Task(user_id=user2_id, description="User 2 task", completed=False)
    session.add_all([task1, task2])
    session.commit()
    
    # Verify each user only sees their own tasks
    response1 = client.get(f"/api/{user1_id}/tasks")
    assert response1.status_code == 200
    tasks1 = response1.json()
    assert len(tasks1) == 1
    assert tasks1[0]["description"] == "User 1 task"
    
    response2 = client.get(f"/api/{user2_id}/tasks")
    assert response2.status_code == 200
    tasks2 = response2.json()
    assert len(tasks2) == 1
    assert tasks2[0]["description"] == "User 2 task"


def test_filtering_by_completion_status(client: TestClient, session: Session):
    """Test filtering tasks by completion status."""
    user_id = uuid4()
    user = User(id=user_id, email="filter@example.com", name="Filter User")
    session.add(user)
    
    # Create mix of completed and incomplete tasks
    tasks = [
        Task(user_id=user_id, description="Task 1", completed=False),
        Task(user_id=user_id, description="Task 2", completed=True),
        Task(user_id=user_id, description="Task 3", completed=False),
        Task(user_id=user_id, description="Task 4", completed=True),
    ]
    session.add_all(tasks)
    session.commit()
    
    # Test filtering
    response = client.get(f"/api/{user_id}/tasks?completed=false")
    assert response.status_code == 200
    active_tasks = response.json()
    assert len(active_tasks) == 2
    assert all(not t["completed"] for t in active_tasks)
    
    response = client.get(f"/api/{user_id}/tasks?completed=true")
    assert response.status_code == 200
    completed_tasks = response.json()
    assert len(completed_tasks) == 2
    assert all(t["completed"] for t in completed_tasks)


def test_pagination(client: TestClient, session: Session):
    """Test task list pagination."""
    user_id = uuid4()
    user = User(id=user_id, email="pagination@example.com", name="Pagination User")
    session.add(user)
    
    # Create 50 tasks
    tasks = [
        Task(user_id=user_id, description=f"Task {i}", completed=False)
        for i in range(50)
    ]
    session.add_all(tasks)
    session.commit()
    
    # Test pagination
    response = client.get(f"/api/{user_id}/tasks?limit=10&offset=0")
    assert response.status_code == 200
    page1 = response.json()
    assert len(page1) == 10
    
    response = client.get(f"/api/{user_id}/tasks?limit=10&offset=10")
    assert response.status_code == 200
    page2 = response.json()
    assert len(page2) == 10
    # assert page1[0]["id"] != page2[0]["id"]  # Different tasks
