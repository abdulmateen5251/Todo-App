"""Database session management for Neon PostgreSQL."""
import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

load_dotenv()

# Get database URL from environment (must be asyncpg://)
DATABASE_URL = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

# Ensure asyncpg driver is specified
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine with connection pooling for Neon Serverless
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "False").lower() == "true",
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before using
)

# Async session factory
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get async database session.
    
    Yields:
        Async database session that is automatically closed after use.
    """
    async with async_session_maker() as session:
        yield session


async def init_db() -> None:
    """Initialize database tables."""
    from src.models.task import Task  # noqa: F401
    from src.models.user import User  # noqa: F401
    from src.models.conversation import ConversationMessage  # noqa: F401
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
