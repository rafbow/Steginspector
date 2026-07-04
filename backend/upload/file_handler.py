"""
Upload handling and validation.
"""
from pathlib import Path
from typing import Any, Dict
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from PIL import Image as PILImage

from config import settings
from utils.file_utils import ensure_directory, get_file_mime_type
from utils.logger import get_logger

logger = get_logger(__name__)


class FileHandler:
    """Saves validated uploaded images to disk."""

    async def save_upload(self, upload: UploadFile) -> Dict[str, Any]:
        original_name = upload.filename or "uploaded-image"
        extension = Path(original_name).suffix.lower().lstrip(".")
        if extension not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file extension: .{extension}",
            )

        ensure_directory(settings.UPLOAD_DIR)
        stored_name = f"{uuid4().hex}.{extension}"
        destination = Path(settings.UPLOAD_DIR).resolve() / stored_name
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

        size = 0
        try:
            with open(destination, "wb") as out:
                while chunk := await upload.read(1024 * 1024):
                    size += len(chunk)
                    if size > max_bytes:
                        out.close()
                        destination.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit",
                        )
                    out.write(chunk)
        finally:
            await upload.close()

        width = None
        height = None
        try:
            with PILImage.open(destination) as img:
                width, height = img.size
                img.verify()
        except Exception:
            destination.unlink(missing_ok=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not a valid image",
            )

        return {
            "filename": stored_name,
            "original_name": original_name,
            "file_path": str(destination),
            "file_size": size,
            "extension": extension,
            "mime_type": get_file_mime_type(str(destination)),
            "width": width,
            "height": height,
        }
