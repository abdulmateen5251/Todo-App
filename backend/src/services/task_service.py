"""Task service for managing task CRUD operations."""
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from src.models.task import Task, TaskStatus, TaskPriority


class TaskService:
    """Service for task management operations."""
    
    async def create_task(
        self,
        session: AsyncSession,
        user_id: int,
        title: str,
        description: Optional[str] = None,
        priority: TaskPriority = TaskPriority.MEDIUM,
        category: Optional[str] = None,
        due_date: Optional[datetime] = None
    ) -> Task:
        """
        Create a new task for the user.
        
        Args:
            session: Database session
            user_id: Owner of the task
            title: Task title (required)
            description: Detailed description (optional)
            priority: Task priority (default: medium)
            category: Task category/tag (optional)
            due_date: When the task is due (optional)
            
        Returns:
            Created Task instance
        """
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            status=TaskStatus.PENDING,
            priority=priority,
            category=category,
            due_date=due_date,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(task)
        await session.commit()
        await session.refresh(task)
        
        return task
    
    async def get_tasks(
        self,
        session: AsyncSession,
        user_id: int,
        status: Optional[TaskStatus] = None,
        category: Optional[str] = None,
        priority: Optional[TaskPriority] = None
    ) -> List[Task]:
        """
        Retrieve tasks for a user with optional filtering.
        
        Args:
            session: Database session
            user_id: User ID to fetch tasks for
            status: Filter by status (optional)
            category: Filter by category (optional)
            priority: Filter by priority (optional)
            
        Returns:
            List of matching tasks ordered by creation date (newest first)
        """
        statement = select(Task).where(Task.user_id == user_id)
        
        # Apply filters
        if status is not None:
            statement = statement.where(Task.status == status)
        if category is not None:
            statement = statement.where(Task.category == category)
        if priority is not None:
            statement = statement.where(Task.priority == priority)
        
        # Order by creation date descending
        statement = statement.order_by(col(Task.created_at).desc())
        
        result = await session.execute(statement)
        return list(result.scalars().all())
    
    async def get_task_by_id(
        self,
        session: AsyncSession,
        task_id: int,
        user_id: int
    ) -> Optional[Task]:
        """
        Get a specific task by ID, ensuring it belongs to the user.
        
        Args:
            session: Database session
            task_id: Task ID to retrieve
            user_id: User ID for authorization
            
        Returns:
            Task if found and owned by user, None otherwise
        """
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        
        result = await session.execute(statement)
        return result.scalar_one_or_none()
    
    async def update_task(
        self,
        session: AsyncSession,
        task_id: int,
        user_id: int,
        **updates
    ) -> Optional[Task]:
        """
        Update task fields.
        
        Args:
            session: Database session
            task_id: Task to update
            user_id: User ID for authorization
            **updates: Fields to update
            
        Returns:
            Updated Task or None if not found
        """
        task = await self.get_task_by_id(session, task_id, user_id)
        
        if task is None:
            return None
        
        # Apply updates
        for field, value in updates.items():
            if hasattr(task, field):
                setattr(task, field, value)
        
        task.updated_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(task)
        
        return task
    
    async def mark_complete(
        self,
        session: AsyncSession,
        task_id: int,
        user_id: int
    ) -> Optional[Task]:
        """
        Mark a task as completed.
        
        Args:
            session: Database session
            task_id: Task to complete
            user_id: User ID for authorization
            
        Returns:
            Updated Task or None if not found
        """
        task = await self.get_task_by_id(session, task_id, user_id)
        
        if task is None:
            return None
        
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        
        await session.commit()
        await session.refresh(task)
        
        return task
    
    async def delete_task(
        self,
        session: AsyncSession,
        task_id: int,
        user_id: int
    ) -> bool:
        """
        Permanently delete a task.
        
        Args:
            session: Database session
            task_id: Task to delete
            user_id: User ID for authorization
            
        Returns:
            True if deleted, False if not found
        """
        task = await self.get_task_by_id(session, task_id, user_id)
        
        if task is None:
            return False
        
        await session.delete(task)
        await session.commit()
        
        return True


# Singleton instance
task_service = TaskService()
