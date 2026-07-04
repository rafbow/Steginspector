"""
History API route — no-auth mode.
"""
from math import ceil
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import csv, io

from database import get_db
from repository.analysis_repo import get_all_analyses_by_user
from schemas import HistoryResponse

ANON_USER_ID = 1
router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/", response_model=HistoryResponse)
async def history(
    search: str = "",
    filter: str = Query("all"),
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    page  = max(1, page)
    limit = min(max(1, limit), 100)
    items, total = await get_all_analyses_by_user(
        db,
        user_id=ANON_USER_ID,
        search=search,
        status_filter=filter,
        page=page,
        limit=limit,
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": ceil(total / limit) if total else 0,
    }


@router.get("/export")
async def export_history(db: AsyncSession = Depends(get_db)):
    """Export all history as CSV."""
    items, _ = await get_all_analyses_by_user(
        db, user_id=ANON_USER_ID, search="", status_filter="all", page=1, limit=9999
    )
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "original_name", "extension", "file_size", "status",
                    "upload_date", "analysis_date", "risk_score", "risk_level"],
    )
    writer.writeheader()
    for item in items:
        writer.writerow({k: item.get(k, "") for k in writer.fieldnames})
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=steginspector_history.csv"},
    )
