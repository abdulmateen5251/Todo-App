"""Authentication dependencies for Better Auth token validation."""
import os
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

security = HTTPBearer(auto_error=False)  # Don't auto-error in dev mode

# Development mode flag
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"


def ensure_user_exists(user_id: UUID, session: Session) -> None:
    """
    Ensure user exists in database. Auto-create in dev mode.
    
    Args:
        user_id: User ID to check/create
        session: Database session
        
    Raises:
        HTTPException: If user doesn't exist in production mode
    """
    from src.models.user import User
    
    # Check if user exists
    user = session.get(User, user_id)
    
    if not user:
        if DEV_MODE:
            # Auto-create user in development mode
            user = User(
                id=user_id,
                email=f"dev-user-{user_id}@example.com",
                name=f"Dev User"
            )
            session.add(user)
            session.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )


async def validate_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UUID:
    """
    Validate Better Auth token and extract user_id.
    
    In production, this should:
    1. Verify the token signature against Better Auth's public keys
    2. Check token expiry
    3. Extract user_id from the 'sub' claim
    
    For MVP/development, this is a placeholder that requires implementation
    of actual JWT verification with Better Auth.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        
    Returns:
        user_id extracted from token claims
        
    Raises:
        HTTPException: If token is invalid or expired (401)
    """
    # Development mode: Accept user_id directly from path
    # This allows frontend to work without authentication
    if DEV_MODE:
        # In dev mode, we'll extract user_id from the request path
        # The actual user_id validation happens in the endpoint
        # For now, return a placeholder that gets checked later
        return UUID("00000000-0000-0000-0000-000000000000")
    
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token"
        )
    
    token = credentials.credentials
    
    # TODO: Implement actual Better Auth token validation
    # This requires:
    # 1. Fetching Better Auth's public keys (JWKS)
    # 2. Verifying token signature using jose.jwt.decode()
    # 3. Checking expiry and other claims
    # 4. Extracting user_id from 'sub' claim
    
    # Placeholder implementation for development
    # In production, replace this with actual JWT validation
    try:
        user_id = extract_user_id_from_token(token)
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}"
        )


def extract_user_id_from_token(token: str) -> UUID:
    """
    Extract user_id from Better Auth JWT token.
    
    TODO: Implement actual JWT decoding and validation.
    
    Args:
        token: JWT token string
        
    Returns:
        user_id from token's 'sub' claim
        
    Raises:
        ValueError: If token cannot be decoded or user_id is missing
    """
    # Placeholder - in production, use:
    # from jose import jwt
    # payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
    # return UUID(payload["sub"])
    
    raise NotImplementedError(
        "Better Auth token validation not yet implemented. "
        "See src/auth/dependencies.py for TODO notes."
    )


def verify_user_match(path_user_id: UUID, token_user_id: UUID) -> None:
    """
    Verify that the user_id in the path matches the authenticated user.
    
    Args:
        path_user_id: user_id from URL path parameter
        token_user_id: user_id extracted from authentication token
        
    Raises:
        HTTPException: If user_ids don't match (403 Forbidden)
    """
    # In development mode, skip user verification
    # This allows testing with any user_id
    if DEV_MODE:
        return
    
    if path_user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: User ID mismatch"
        )
