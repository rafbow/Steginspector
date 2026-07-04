"""
Analysis API routes — no-auth mode.
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from repository.analysis_repo import get_analysis_by_image
from repository.image_repo import update_image_status
from schemas import AnalysisResultsResponse, AnalysisStatusResponse
from service.analysis_service import (
    ensure_analysis_record,
    run_analysis_background,
    serialize_analysis,
)
from service.image_service import get_image_or_404

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/run/{image_id}", response_model=AnalysisStatusResponse)
async def run_analysis_endpoint(
    image_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    image = await get_image_or_404(db, image_id)
    if image.status == "processing":
        return {
            "image_id": image_id,
            "status": "processing",
            "progress": 0,
            "message": "Analysis is already running",
        }
    analysis = await ensure_analysis_record(db, image_id)
    await update_image_status(db, image_id, "processing")
    await db.commit()
    background_tasks.add_task(run_analysis_background, image_id)
    return {
        "image_id": image_id,
        "status": "processing",
        "progress": analysis.progress,
        "message": "Analysis started",
    }


@router.get("/{image_id}/status", response_model=AnalysisStatusResponse)
async def status_endpoint(image_id: int, db: AsyncSession = Depends(get_db)):
    image    = await get_image_or_404(db, image_id)
    analysis = await get_analysis_by_image(db, image_id)
    return {
        "image_id": image_id,
        "status":   image.status,
        "progress": analysis.progress if analysis else 0,
        "message":  (analysis.error_message if analysis and analysis.error_message else image.status),
    }


@router.get("/{image_id}/results", response_model=AnalysisResultsResponse)
async def results_endpoint(image_id: int, db: AsyncSession = Depends(get_db)):
    image    = await get_image_or_404(db, image_id)
    analysis = await get_analysis_by_image(db, image_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis result not found")
    return serialize_analysis(analysis, image.status)
