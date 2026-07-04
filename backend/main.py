"""
FastAPI entry point for StegInspector — No-Auth Tool Mode.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api import analysis, dashboard, history, images, reports
from config import settings
from database import init_db
from utils.file_utils import ensure_directory
from utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Digital Forensics — Image Steganography Analysis Tool",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    ensure_directory(settings.UPLOAD_DIR)
    ensure_directory(settings.REPORTS_DIR)
    await init_db()
    logger.info("StegInspector started — no-auth mode")


@app.get("/")
async def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION, "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(images.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)
app.include_router(history.router)
app.include_router(reports.router)
