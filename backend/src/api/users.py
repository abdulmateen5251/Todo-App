"""User API endpoints."""
from uuid import UUID, uuid4
from typing import Dict

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from src.db.session import get_session
from src.models.user import User
from src.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(
    user_data: UserCreate,
    session: Session = Depends(get_session)
) -> User:
    """
    Register a new user.
    
    In development mode, passwords are not hashed.
    In production, you should hash passwords before storing.
    """
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        id=uuid4(),
        email=user_data.email,
        name=user_data.name or user_data.email.split('@')[0]
    )
    
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=UserResponse)
async def login_user(
    credentials: UserLogin,
    session: Session = Depends(get_session)
) -> User:
    """
    Login user and return user data.
    
    In development mode, any password is accepted if user exists.
    In production, you should verify password hash.
    """
    user = session.exec(
        select(User).where(User.email == credentials.email)
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # In development, accept any password
    # In production, verify password hash here
    
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    session: Session = Depends(get_session)
) -> User:
    """Get user by ID."""
    user = session.get(User, user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    session: Session = Depends(get_session)
) -> User:
    """Get user by email."""
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
