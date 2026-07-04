"""
Analysis repository — database access layer for AnalysisResult model.
"""
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select, update, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.analysis import AnalysisResult
from models.image import Image
from utils.logger import get_logger

logger = get_logger(__name__)


async def create_analysis(db: AsyncSession, image_id: int) -> AnalysisResult:
    """Create a new blank AnalysisResult record for an image."""
    analysis = AnalysisResult(
        image_id=image_id,
        progress=0,
        risk_score=0,
        risk_level="Unknown",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(analysis)
    await db.flush()
    await db.refresh(analysis)
    return analysis


async def get_analysis_by_image(
    db: AsyncSession, image_id: int
) -> Optional[AnalysisResult]:
    """Fetch analysis result by image ID."""
    result = await db.execute(
        select(AnalysisResult).where(AnalysisResult.image_id == image_id)
    )
    return result.scalar_one_or_none()


async def update_analysis(
    db: AsyncSession, analysis_id: int, **kwargs
) -> Optional[AnalysisResult]:
    """Update analysis result fields by ID."""
    kwargs["updated_at"] = datetime.utcnow()
    await db.execute(
        update(AnalysisResult).where(AnalysisResult.id == analysis_id).values(**kwargs)
    )
    await db.flush()
    result = await db.execute(
        select(AnalysisResult).where(AnalysisResult.id == analysis_id)
    )
    return result.scalar_one_or_none()


async def get_all_analyses_by_user(
    db: AsyncSession,
    user_id: int,
    search: str = "",
    status_filter: str = "",
    page: int = 1,
    limit: int = 10,
) -> tuple[List[dict], int]:
    """
    Get paginated analysis history for a user.

    Returns list of dicts combining image + analysis data.
    """
    base_q = (
        select(Image, AnalysisResult)
        .outerjoin(AnalysisResult, Image.id == AnalysisResult.image_id)
        .where(Image.user_id == user_id)
    )
    count_q = (
        select(func.count(Image.id))
        .outerjoin(AnalysisResult, Image.id == AnalysisResult.image_id)
        .where(Image.user_id == user_id)
    )

    if search:
        like = f"%{search}%"
        base_q = base_q.where(Image.original_name.ilike(like))
        count_q = count_q.where(Image.original_name.ilike(like))

    if status_filter and status_filter != "all":
        if status_filter in ("completed", "pending", "processing", "failed"):
            base_q = base_q.where(Image.status == status_filter)
            count_q = count_q.where(Image.status == status_filter)
        elif status_filter in ("safe", "needs review", "suspicious"):
            base_q = base_q.where(
                func.lower(AnalysisResult.risk_level) == status_filter.lower()
            )
            count_q = count_q.where(
                func.lower(AnalysisResult.risk_level) == status_filter.lower()
            )

    total_r = await db.execute(count_q)
    total = total_r.scalar_one() or 0

    rows = await db.execute(
        base_q.order_by(Image.upload_date.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    items = []
    for img, analysis in rows:
        items.append({
            "id": img.id,
            "original_name": img.original_name,
            "extension": img.extension,
            "file_size": img.file_size,
            "status": img.status,
            "upload_date": img.upload_date,
            "analysis_date": img.analysis_date,
            "risk_score": analysis.risk_score if analysis else None,
            "risk_level": analysis.risk_level if analysis else None,
        })

    return items, total


async def count_suspicious_by_user(db: AsyncSession, user_id: int) -> int:
    """Count images with 'Suspicious' risk level for a user."""
    result = await db.execute(
        select(func.count(AnalysisResult.id))
        .join(Image, AnalysisResult.image_id == Image.id)
        .where(
            and_(
                Image.user_id == user_id,
                AnalysisResult.risk_level == "Suspicious",
            )
        )
    )
    return result.scalar_one() or 0


async def get_average_entropy(db: AsyncSession, user_id: int) -> float:
    """Calculate average entropy value across all completed analyses for a user."""
    import json

    result = await db.execute(
        select(AnalysisResult.entropy_data)
        .join(Image, AnalysisResult.image_id == Image.id)
        .where(
            and_(
                Image.user_id == user_id,
                AnalysisResult.entropy_data.isnot(None),
            )
        )
    )
    rows = result.scalars().all()

    if not rows:
        return 0.0

    values = []
    for row in rows:
        try:
            data = json.loads(row)
            if "value" in data:
                values.append(float(data["value"]))
        except Exception:
            pass

    return round(sum(values) / len(values), 4) if values else 0.0


async def get_analyses_per_day(db: AsyncSession, user_id: int, days: int = 7) -> List[dict]:
    """Get count of completed analyses per day for the last N days."""
    from datetime import timedelta
    result = []
    now = datetime.utcnow().date()
    for i in range(days - 1, -1, -1):
        day = now - timedelta(days=i)
        count_r = await db.execute(
            select(func.count(Image.id)).where(
                and_(
                    Image.user_id == user_id,
                    Image.status == "completed",
                    func.date(Image.analysis_date) == day,
                )
            )
        )
        count = count_r.scalar_one() or 0
        result.append({"date": day.strftime("%a"), "count": count})
    return result
