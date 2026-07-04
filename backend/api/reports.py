"""
Reports API route — no-auth mode.
"""
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from report.pdf_generator import PDFReportGenerator
from repository.analysis_repo import get_analysis_by_image
from repository.report_repo import create_report, get_reports_by_user
from schemas import ReportResponse
from service.analysis_service import serialize_analysis
from service.image_service import get_image_or_404

ANON_USER_ID = 1
router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/", response_model=List[ReportResponse])
async def list_reports(db: AsyncSession = Depends(get_db)):
    return await get_reports_by_user(db, ANON_USER_ID)


@router.post("/generate/{image_id}")
async def generate_report(image_id: int, db: AsyncSession = Depends(get_db)):
    """Generate a PDF report for the given image."""
    image    = await get_image_or_404(db, image_id)
    analysis = await get_analysis_by_image(db, image_id)
    if not analysis or image.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis must be completed before generating a report",
        )
    results   = serialize_analysis(analysis, image.status)
    generated = PDFReportGenerator().generate(image, results)
    report    = await create_report(
        db,
        image_id=image.id,
        user_id=ANON_USER_ID,
        pdf_path=generated["pdf_path"],
        pdf_filename=generated["pdf_filename"],
    )
    await db.commit()
    return {"id": report.id, "pdf_filename": report.pdf_filename, "message": "Report generated"}


@router.get("/{report_id}/download")
async def download_report(report_id: int, db: AsyncSession = Depends(get_db)):
    """Download a generated PDF report."""
    from repository.report_repo import get_report_by_id
    report = await get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    path = Path(report.pdf_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file not found on disk")
    return FileResponse(path=path, filename=report.pdf_filename, media_type="application/pdf")
