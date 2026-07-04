"""
Embedded printable string extraction for image files.
"""
from typing import Any, Dict, List
import re

from utils.logger import get_logger

logger = get_logger(__name__)

ASCII_RE = re.compile(rb"[\x20-\x7E]{4,}")
UTF16LE_RE = re.compile((rb"(?:[\x20-\x7E]\x00){4,}"))
URL_RE = re.compile(r"https?://|www\.", re.IGNORECASE)
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
HEX_RE = re.compile(r"^[0-9A-Fa-f]{16,}$")
BASE64_RE = re.compile(r"^[A-Za-z0-9+/]{20,}={0,2}$")


class StringsExtractor:
    """Extracts readable ASCII and UTF-16LE strings with offsets."""

    def extract(self, file_path: str, min_length: int = 4, limit: int = 500) -> Dict[str, Any]:
        try:
            with open(file_path, "rb") as f:
                data = f.read()
        except Exception as exc:
            logger.error(f"String extraction failed for {file_path}: {exc}")
            return {"strings": [], "total": 0, "by_type": {}}

        items: List[Dict[str, Any]] = []

        for match in ASCII_RE.finditer(data):
            value = match.group().decode("ascii", errors="ignore")
            if len(value) >= min_length:
                items.append(self._item(value, "ascii", match.start()))

        for match in UTF16LE_RE.finditer(data):
            value = match.group().decode("utf-16le", errors="ignore")
            if len(value) >= min_length:
                items.append(self._item(value, "utf16le", match.start()))

        items.sort(key=lambda item: item["offset"])
        by_type: Dict[str, int] = {}
        for item in items:
            by_type[item["type"]] = by_type.get(item["type"], 0) + 1

        return {"strings": items[:limit], "total": len(items), "by_type": by_type}

    def _item(self, value: str, encoding_type: str, offset: int) -> Dict[str, Any]:
        normalized = value.strip()
        value_type = encoding_type
        if URL_RE.search(normalized):
            value_type = "url"
        elif EMAIL_RE.match(normalized):
            value_type = "email"
        elif HEX_RE.match(normalized):
            value_type = "hex"
        elif BASE64_RE.match(normalized) and len(normalized) % 4 == 0:
            value_type = "base64"

        return {"value": normalized[:500], "type": value_type, "offset": offset}
