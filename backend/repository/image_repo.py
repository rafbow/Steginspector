"""
Image repository — database access layer for Image model.
"""
from datetime import datetime, date
from typing import Optional, List

from sqlalchemy import select, update, delete, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.image import Image
from utils.logger import get_logger

logger = get_logger(__name__)


async def create_image(
    db: AsyncSession,
    user_id: int,
    filename: str,
    original_name: str,
    file_path: str,
    file_size: int,
    extension: str,
    mime_type: Optional[str] = None,
    width: Optional[int] = None,
    height: Optional[int] = None,
) -> Image:
    """Create and persist a new image record."""
    image = Image(
        user_id=user_id,
        filename=filename,
        original_name=original_name,
        file_path=file_path,
        file_size=file_size,
        extension=extension,
        mime_type=mime_type,
        width=width,
        height=height,
        status="pending",
        upload_date=datetime.utcnow(),
    )
    db.add(image)
    await db.flush()
    await db.refresh(image)
    logger.info(f"Image record created: {original_name} (id={image.id})")
    return image


async def get_image_by_id(db: AsyncSession, image_id: int) -> Optional[Image]:
    """Fetch an image by its primary key."""
    result = await db.execute(select(Image).where(Image.id == image_id))
    return result.scalar_one_or_none()


async def get_all_images(db: AsyncSession) -> List[Image]:
    """Fetch ALL images in the workspace (no-auth mode)."""
    result = await db.execute(select(Image).order_by(Image.upload_date.desc()))
    return list(result.scalars().all())



async def get_images_by_user(db: AsyncSession, user_id: int) -> List[Image]:
    """Fetch all images uploaded by a specific user, newest first."""
    result = await db.execute(
        select(Image).where(Image.user_id == user_id).order_by(Image.upload_date.desc())
    )
    return list(result.scalars().all())


async def update_image_status(
    db: AsyncSession,
    image_id: int,
    status: str,
    analysis_date: Optional[datetime] = None,
) -> Optional[Image]:
    """Update the processing status of an image."""
    values = {"status": status}
    if analysis_date:
        values["analysis_date"] = analysis_date
    await db.execute(update(Image).where(Image.id == image_id).values(**values))
    await db.flush()
    return await get_image_by_id(db, image_id)


async def delete_image(db: AsyncSession, image_id: int) -> bool:
    """Delete an image record by ID. Returns True if deleted."""
    result = await db.execute(delete(Image).where(Image.id == image_id))
    await db.flush()
    return result.rowcount > 0


async def get_recent_images(
    db: AsyncSession, user_id: int, limit: int = 5
) -> List[Image]:
    """Get the most recently uploaded images for a user."""
    result = await db.execute(
        select(Image)
        .where(Image.user_id == user_id)
        .order_by(Image.upload_date.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def count_images_by_user(db: AsyncSession, user_id: int) -> int:
    """Count total images for a user."""
    result = await db.execute(
        select(func.count(Image.id)).where(Image.user_id == user_id)
    )
    return result.scalar_one() or 0


async def count_today_analyses(db: AsyncSession, user_id: int) -> int:
    """Count images analysed today by a user."""
    today = datetime.utcnow().date()
    result = await db.execute(
        select(func.count(Image.id)).where(
            and_(
                Image.user_id == user_id,
                Image.status == "completed",
                func.date(Image.analysis_date) == today,
            )
        )
    )
    return result.scalar_one() or 0


async def search_images(
    db: AsyncSession,
    user_id: int,
    search: str = "",
    page: int = 1,
    limit: int = 10,
) -> tuple[List[Image], int]:
    """
    Search and paginate user images by filename.

    Returns:
        Tuple of (image list, total count)
    """
    base_query = select(Image).where(Image.user_id == user_id)
    count_query = select(func.count(Image.id)).where(Image.user_id == user_id)

    if search:
        like = f"%{search}%"
        base_query = base_query.where(Image.original_name.ilike(like))
        count_query = count_query.where(Image.original_name.ilike(like))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one() or 0

    images_result = await db.execute(
        base_query.order_by(Image.upload_date.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return list(images_result.scalars().all()), total
