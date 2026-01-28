"""User API endpoints."""
import os
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from typing import Dict

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt

from src.db.session import get_session
from src.models.user import User
from src.schemas.user import UserCreate, UserLogin, UserResponse, LoginResponse

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session)
) -> User:
    """
    Register a new user.
    
    In development mode, passwords are not hashed.
    In production, you should hash passwords before storing.
    """
    # Check if user already exists
    result = await session.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        id=uuid4(),
        email=user_data.email,
        name=user_data.name or user_data.email.split('@')[0]
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=LoginResponse)
async def login_user(
    credentials: UserLogin,
    session: AsyncSession = Depends(get_session)
) -> LoginResponse:
    """
    Login user and return user data with JWT token.
    
    In development mode, any password is accepted if user exists.
    In production, you should verify password hash.
    """
    result = await session.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # In development, accept any password
    # In production, verify password hash here
    
    # Generate JWT token
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    access_token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return LoginResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at,
        access_token=access_token,
        token_type="bearer"
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_session)
) -> User:
    """Get user by ID."""
    user = await session.get(User, user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    session: AsyncSession = Depends(get_session)
) -> User:
    """Get user by email."""
    result = await session.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
