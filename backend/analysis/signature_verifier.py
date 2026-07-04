"""
File signature verification against extension and MIME type.
"""
from pathlib import Path
from typing import Any, Dict

from utils.file_utils import get_file_magic_number, get_file_mime_type


EXPECTED = {
    "jpg": ("FFD8FF", "image/jpeg", "JPEG"),
    "jpeg": ("FFD8FF", "image/jpeg", "JPEG"),
    "png": ("89504E47", "image/png", "PNG"),
    "gif": ("47494638", "image/gif", "GIF"),
    "bmp": ("424D", "image/bmp", "BMP"),
    "tif": ("49492A00|4D4D002A", "image/tiff", "TIFF"),
    "tiff": ("49492A00|4D4D002A", "image/tiff", "TIFF"),
    "webp": ("52494646", "image/webp", "WEBP"),
}


class SignatureVerifier:
    """Verifies basic file magic signatures."""

    def verify(self, file_path: str) -> Dict[str, Any]:
        ext = Path(file_path).suffix.lower().lstrip(".")
        magic = get_file_magic_number(file_path, 12)
        mime = get_file_mime_type(file_path)
        expected_magic, expected_mime, detected_format = EXPECTED.get(
            ext, ("Unknown", "application/octet-stream", "Unknown")
        )

        extension_match = self._magic_matches(magic, expected_magic)
        mime_match = mime == expected_mime if expected_mime != "application/octet-stream" else True
        warnings = []

        if expected_magic == "Unknown":
            warnings.append(f"Unsupported or unknown extension: .{ext}")
        if not extension_match:
            warnings.append("File magic number does not match the file extension.")
        if not mime_match:
            warnings.append(f"Detected MIME type {mime} differs from expected {expected_mime}.")

        return {
            "magic_number": magic,
            "expected_magic": expected_magic,
            "extension_match": extension_match,
            "mime_match": mime_match,
            "mismatch": bool(warnings),
            "warnings": warnings,
            "detected_format": detected_format,
            "detected_mime": mime,
        }

    def _magic_matches(self, magic: str, expected: str) -> bool:
        if expected == "Unknown":
            return False
        return any(magic.startswith(part) for part in expected.split("|"))
