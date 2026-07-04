"""
Dashboard stats API — no-auth mode.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import DashboardStats
from repository.image_repo import count_images_by_user, count_today_analyses, get_recent_images
from repository.analysis_repo import (
    count_suspicious_by_user,
    get_average_entropy,
    get_analyses_per_day,
    get_analysis_by_image,
)
from repository.report_repo import get_reports_by_user

ANON_USER_ID = 1
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    recent_images = await get_recent_images(db, ANON_USER_ID, limit=8)
    reports       = await get_reports_by_user(db, ANON_USER_ID)

    recent_files = []
    for img in recent_images:
        analysis = await get_analysis_by_image(db, img.id)
        recent_files.append({
            "id": img.id,
            "original_name": img.original_name,
            "status": img.status,
            "upload_date": img.upload_date,
            "risk_score": analysis.risk_score if analysis else None,
            "risk_level": analysis.risk_level if analysis else None,
        })

    return {
        "total_images":     await count_images_by_user(db, ANON_USER_ID),
        "today_analyses":   await count_today_analyses(db, ANON_USER_ID),
        "suspicious_files": await count_suspicious_by_user(db, ANON_USER_ID),
        "average_entropy":  await get_average_entropy(db, ANON_USER_ID),
        "recent_files":     recent_files,
        "total_reports":    len(reports),
        "analyses_per_day": await get_analyses_per_day(db, ANON_USER_ID, days=7),
    }
