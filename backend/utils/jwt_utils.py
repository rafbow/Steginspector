"""
JWT authentication utilities for StegInspector.
Handles token creation, verification, and FastAPI dependency injection.
"""
from datetime import datetime, timedelta
from typing import Optional, Annotated

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from utils.logger import get_logger

logger = get_logger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload data to encode (should include 'sub' key)
        expires_delta: Token lifetime; defaults to settings value

    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Args:
        token: JWT string

    Returns:
        Decoded payload dict

    Raises:
        HTTPException 401 if token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: Optional[int] = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return payload
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise credentials_exception


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    FastAPI dependency: get the currently authenticated user from JWT.

    Args:
        token: Bearer token from Authorization header
        db: Async database session

    Returns:
        User ORM object

    Raises:
        HTTPException 401 if authentication fails
        HTTPException 403 if user is inactive
    """
    from repository.user_repo import get_user_by_id

    payload = verify_token(token)
    user_id: int = payload.get("user_id")

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    return user


async def get_current_admin(current_user=Depends(get_current_user)):
    """
    FastAPI dependency: ensure current user has admin role.

    Raises:
        HTTPException 403 if user is not an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
