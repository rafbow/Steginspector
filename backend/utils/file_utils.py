"""
File utility helpers for StegInspector.
Handles magic numbers, MIME detection, and file operations.
"""
import os
import struct
from pathlib import Path
from typing import Optional
from utils.logger import get_logger

logger = get_logger(__name__)

# Known file signatures: extension -> (hex_magic, offset)
FILE_MAGIC_MAP: dict[str, tuple[str, int]] = {
    "ffd8ff": "image/jpeg",
    "89504e47": "image/png",
    "47494638": "image/gif",
    "424d": "image/bmp",
    "49492a00": "image/tiff",
    "4d4d002a": "image/tiff",
    "52494646": "image/webp",  # RIFF (need to check bytes 8-11 for WEBP)
}


def get_file_magic_number(file_path: str, num_bytes: int = 8) -> str:
    """
    Read the first N bytes of a file and return as uppercase hex string.

    Args:
        file_path: Path to the file
        num_bytes: Number of bytes to read (default: 8)

    Returns:
        Uppercase hex string of magic bytes, e.g. "89504E47..."
    """
    try:
        with open(file_path, "rb") as f:
            raw = f.read(num_bytes)
        return raw.hex().upper()
    except Exception as e:
        logger.error(f"Failed to read magic number from {file_path}: {e}")
        return ""


def get_file_mime_type(file_path: str) -> str:
    """
    Detect MIME type from file magic bytes.

    Args:
        file_path: Path to the file

    Returns:
        MIME type string, e.g. "image/png"
    """
    magic = get_file_magic_number(file_path, 12).lower()

    if magic.startswith("ffd8ff"):
        return "image/jpeg"
    elif magic.startswith("89504e47"):
        return "image/png"
    elif magic.startswith("47494638"):
        return "image/gif"
    elif magic.startswith("424d"):
        return "image/bmp"
    elif magic.startswith("49492a00") or magic.startswith("4d4d002a"):
        return "image/tiff"
    elif magic.startswith("52494646") and magic[16:24] == "57454250":
        return "image/webp"
    elif magic.startswith("52494646"):
        return "image/webp"  # Assume RIFF is WEBP for images
    else:
        return "application/octet-stream"


def safe_delete_file(file_path: str) -> bool:
    """
    Safely delete a file, ignoring errors if file doesn't exist.

    Args:
        file_path: Path to file to delete

    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Failed to delete {file_path}: {e}")
        return False


def ensure_directory(path: str) -> None:
    """
    Create directory and all parent directories if they don't exist.

    Args:
        path: Directory path to create
    """
    Path(path).mkdir(parents=True, exist_ok=True)


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable form.

    Args:
        size_bytes: File size in bytes

    Returns:
        Formatted string like "4.2 MB"
    """
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"
