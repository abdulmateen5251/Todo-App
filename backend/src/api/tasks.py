"""Task API endpoints."""
from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlmodel import Session, select
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.auth.dependencies import validate_token, verify_user_match, ensure_user_exists
from src.db.session import get_session
from src.models.task import Task
from src.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()

# Initialize limiter for this router
limiter = Limiter(key_func=get_remote_address)


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
@limiter.limit("100/minute")
async def list_tasks(
    request: Request,
    user_id: UUID,
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    limit: int = Query(100, ge=1, le=1000, description="Max tasks to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    session: Session = Depends(get_session),
    auth_user_id: UUID = Depends(validate_token),
):
    """
    List all tasks for a user.
    
    Args:
        user_id: User ID from path (must match authenticated user)
        completed: Optional filter by completion status
        limit: Maximum number of tasks to return (1-1000)
        offset: Pagination offset
        session: Database session
        auth_user_id: Authenticated user ID from token
        
    Returns:
        List of tasks belonging to the user
        
    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
    """
    # Verify user ID matches authenticated user
    verify_user_match(user_id, auth_user_id)
    
    # Ensure user exists (auto-create in dev mode)
    ensure_user_exists(user_id, session)
    
    # Build query
    query = select(Task).where(Task.user_id == user_id)
    
    # Apply filters
    if completed is not None:
        query = query.where(Task.completed == completed)
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    # Order by creation date (newest first)
    query = query.order_by(Task.created_at.desc())
    
    # Execute query
    tasks = session.exec(query).all()
    
    return tasks


@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_task(
    request: Request,
    user_id: UUID,
    task_create: TaskCreate,
    session: Session = Depends(get_session),
    auth_user_id: UUID = Depends(validate_token),
):
    """
    Create a new task for a user.
    
    Args:
        user_id: User ID from path (must match authenticated user)
        task_create: Task creation data
        session: Database session
        auth_user_id: Authenticated user ID from token
        
    Returns:
        Created task
        
    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 400 if validation fails
    """
    # Verify user ID matches authenticated user
    verify_user_match(user_id, auth_user_id)
    
    # Ensure user exists (auto-create in dev mode)
    ensure_user_exists(user_id, session)
    
    # Create task
    db_task = Task(
        user_id=user_id,
        description=task_create.description,
        due_date=task_create.due_date,
    )
    
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    
    return db_task


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
@limiter.limit("100/minute")
async def get_task(
    request: Request,
    user_id: UUID,
    task_id: UUID,
    session: Session = Depends(get_session),
    auth_user_id: UUID = Depends(validate_token),
):
    """
    Get a specific task.
    
    Args:
        user_id: User ID from path (must match authenticated user)
        task_id: Task ID to retrieve
        session: Database session
        auth_user_id: Authenticated user ID from token
        
    Returns:
        Task details
        
    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
    """
    # Verify user ID matches authenticated user
    verify_user_match(user_id, auth_user_id)
    
    # Get task
    task = session.get(Task, task_id)
    
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
@limiter.limit("20/minute")
async def update_task(
    request: Request,
    user_id: UUID,
    task_id: UUID,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    auth_user_id: UUID = Depends(validate_token),
):
    """
    Update a task.
    
    Args:
        user_id: User ID from path (must match authenticated user)
        task_id: Task ID to update
        task_update: Task update data
        session: Database session
        auth_user_id: Authenticated user ID from token
        
    Returns:
        Updated task
        
    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
    """
    # Verify user ID matches authenticated user
    verify_user_match(user_id, auth_user_id)
    
    # Get task
    task = session.get(Task, task_id)
    
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update task fields
    task_data = task_update.model_dump(exclude_unset=True)
    for field, value in task_data.items():
        setattr(task, field, value)
    
    # Update timestamp
    from datetime import datetime
    task.updated_at = datetime.utcnow()
    
    session.add(task)
    session.commit()
    session.refresh(task)
    
    return task


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
@limiter.limit("30/minute")
async def toggle_task_completion(
    request: Request,
    user_id: UUID,
    task_id: UUID,
    session: Session = Depends(get_session),
    auth_user_id: UUID = Depends(validate_token),
):
    """
    Toggle task completion status.
    
    Args:
        user_id: User ID from path (must match authenticated user)
        task_id: Task ID to toggle
        session: Database session
        auth_user_id: Authenticated user ID from token
        
    Returns:
        Updated task
        
    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
    """
    # Verify user ID matches authenticated user
    verify_user_match(user_id, auth_user_id)
    
    # Get task
    task = session.get(Task, task_id)
    
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Toggle completion
    task.completed = not task.completed
    
    # Update timestamp
    from datetime import datetime
    task.updated_at = datetime.utcnow()
    
    session.add(task)
    session.commit()
    session.refresh(task)
    
    return task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_task(
    request: Request,
    user_id: UUID,
    task_id: UUID,
    session: Session = Depends(get_session),
    auth_user_id: UUID = Depends(validate_token),
):
    """
    Delete a task.
    
    Args:
        user_id: User ID from path (must match authenticated user)
        task_id: Task ID to delete
        session: Database session
        auth_user_id: Authenticated user ID from token
        
    Raises:
        HTTPException: 403 if user_id doesn't match authenticated user
        HTTPException: 404 if task not found
    """
    # Verify user ID matches authenticated user
    verify_user_match(user_id, auth_user_id)
    
    # Get task
    task = session.get(Task, task_id)
    
    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Delete task
    session.delete(task)
    session.commit()
