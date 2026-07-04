"""
Report repository — database access layer for Report model.
"""
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from models.analysis import Report
from utils.logger import get_logger

logger = get_logger(__name__)


async def create_report(
    db: AsyncSession,
    image_id: int,
    user_id: int,
    pdf_path: str,
    pdf_filename: str,
) -> Report:
    """Create and persist a new report record."""
    report = Report(
        image_id=image_id,
        user_id=user_id,
        pdf_path=pdf_path,
        pdf_filename=pdf_filename,
        created_at=datetime.utcnow(),
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    logger.info(f"Report created: {pdf_filename} (image_id={image_id})")
    return report


async def get_report_by_id(db: AsyncSession, report_id: int) -> Optional[Report]:
    """Fetch a report by its primary key."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    return result.scalar_one_or_none()


async def get_report_by_image(db: AsyncSession, image_id: int) -> Optional[Report]:
    """Fetch the most recent report for an image."""
    result = await db.execute(
        select(Report)
        .where(Report.image_id == image_id)
        .order_by(Report.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_reports_by_user(db: AsyncSession, user_id: int) -> List[Report]:
    """Fetch all reports for a user, newest first."""
    result = await db.execute(
        select(Report)
        .where(Report.user_id == user_id)
        .order_by(Report.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_report(db: AsyncSession, report_id: int) -> bool:
    """Delete a report record. Returns True if deleted."""
    result = await db.execute(delete(Report).where(Report.id == report_id))
    await db.flush()
    return result.rowcount > 0
