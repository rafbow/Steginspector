"""
Configuration settings for StegInspector backend.
Loads from .env file using python-dotenv (dev) or environment variables (Render/production).
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

# On Render, use the mounted disk path; locally use relative paths
_DATA_DIR = os.getenv("DATA_DIR", str(BASE_DIR))


class Settings:
    # Database — SQLite locally, can be swapped for PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{_DATA_DIR}/steginspector.db",
    )

    # File storage — use mounted disk on Render
    UPLOAD_DIR:  str = os.getenv("UPLOAD_DIR",  str(Path(_DATA_DIR) / "uploads"))
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", str(Path(_DATA_DIR) / "reports"))

    # File validation
    MAX_UPLOAD_SIZE_MB:  int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
    ALLOWED_EXTENSIONS: set = set(
        os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,bmp,gif,tiff,tif,webp").split(",")
    )

    # CORS — comma-separated list of allowed origins
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")

    # App metadata
    APP_NAME:    str = "StegInspector"
    APP_VERSION: str = "2.0.0"


settings = Settings()
