"""
User repository — database access layer for User model.
All functions are async and use SQLAlchemy 2.0 style.
"""
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from utils.logger import get_logger

logger = get_logger(__name__)


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Fetch a user by their primary key."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Fetch a user by email address (case-insensitive)."""
    result = await db.execute(
        select(User).where(User.email == email.lower().strip())
    )
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    full_name: str,
    password_hash: str,
    role: str = "investigator",
) -> User:
    """
    Create and persist a new user.

    Args:
        db: Async database session
        email: User email (will be lowercased)
        full_name: Display name
        password_hash: Bcrypt hash of the password
        role: User role ('admin' or 'investigator')

    Returns:
        Newly created User object
    """
    user = User(
        email=email.lower().strip(),
        full_name=full_name,
        password_hash=password_hash,
        role=role,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    logger.info(f"Created user: {user.email} (role={role})")
    return user


async def update_user(db: AsyncSession, user_id: int, **kwargs) -> Optional[User]:
    """
    Update user fields by ID.

    Args:
        db: Async database session
        user_id: User primary key
        **kwargs: Fields to update

    Returns:
        Updated User object or None if not found
    """
    kwargs["updated_at"] = datetime.utcnow()
    await db.execute(update(User).where(User.id == user_id).values(**kwargs))
    await db.flush()
    return await get_user_by_id(db, user_id)


async def get_all_users(db: AsyncSession) -> List[User]:
    """Return all users (admin use only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return list(result.scalars().all())


async def count_all_users(db: AsyncSession) -> int:
    """Count total registered users."""
    from sqlalchemy import func
    result = await db.execute(select(func.count(User.id)))
    return result.scalar_one() or 0
