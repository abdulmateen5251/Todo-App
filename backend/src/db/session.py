"""Database session management for Neon PostgreSQL."""
import os
from typing import Generator

from sqlalchemy.pool import NullPool
from sqlmodel import Session, create_engine
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# For Neon Serverless, use NullPool to avoid connection pooling issues
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    echo=os.getenv("DEBUG", "False").lower() == "true"
)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency to get database session.
    
    Yields:
        Database session that is automatically closed after use.
    """
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """Initialize database tables."""
    from src.models import Task, User  # noqa: F401
    from sqlmodel import SQLModel
    
    SQLModel.metadata.create_all(engine)
