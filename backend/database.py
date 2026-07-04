"""
Async SQLAlchemy database setup for StegInspector.
Uses aiosqlite for async SQLite operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that provides an async database session.
    Automatically closes session after request completes.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize the database by creating all tables.
    Called on application startup.
    """
    # Import all models to ensure they are registered with Base
    from models import user, image, analysis  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
