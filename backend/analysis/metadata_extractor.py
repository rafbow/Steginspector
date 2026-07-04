"""
Metadata Extractor — extracts EXIF and file metadata using exifread and Pillow.
"""
import os
import math
from datetime import datetime
from typing import Any, Dict, Optional

import exifread
from PIL import Image as PILImage

from utils.logger import get_logger
from utils.file_utils import get_file_magic_number, get_file_mime_type

logger = get_logger(__name__)


class MetadataExtractor:
    """Extracts EXIF metadata and basic image information."""

    def get_image_info(self, file_path: str) -> Dict[str, Any]:
        """
        Get comprehensive image file information using Pillow and OS stats.

        Args:
            file_path: Path to the image file

        Returns:
            Dict with filename, extension, size, dimensions, color mode, etc.
        """
        info: Dict[str, Any] = {}
        filename = os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lstrip(".").lower()

        # OS-level file stats
        try:
            stat = os.stat(file_path)
            info["filename"] = filename
            info["extension"] = ext.upper()
            info["size_bytes"] = stat.st_size
            info["size_formatted"] = self._format_size(stat.st_size)
            info["created_date"] = datetime.fromtimestamp(stat.st_ctime).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
            info["modified_date"] = datetime.fromtimestamp(stat.st_mtime).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        except Exception as e:
            logger.warning(f"OS stat failed: {e}")

        # Magic number and MIME type
        info["magic_number"] = get_file_magic_number(file_path, 8)
        info["file_signature"] = info["magic_number"][:8] if info.get("magic_number") else "Unknown"
        info["mime_type"] = get_file_mime_type(file_path)

        # Pillow image properties
        try:
            with PILImage.open(file_path) as img:
                w, h = img.size
                info["width"] = w
                info["height"] = h
                info["resolution"] = f"{w} × {h}"
                info["aspect_ratio"] = self._calc_aspect_ratio(w, h)
                info["color_mode"] = img.mode
                info["format"] = img.format or ext.upper()

                # Bit depth
                mode_bits = {
                    "1": 1, "L": 8, "P": 8, "RGB": 24,
                    "RGBA": 32, "CMYK": 32, "YCbCr": 24,
                    "LAB": 24, "HSV": 24, "I": 32, "F": 32,
                }
                info["bit_depth"] = mode_bits.get(img.mode, 8)
        except Exception as e:
            logger.warning(f"Pillow image info failed: {e}")

        return info

    def extract(self, file_path: str) -> Dict[str, Any]:
        """
        Extract EXIF metadata using exifread library.

        Args:
            file_path: Path to the image file

        Returns:
            Dict with structured EXIF fields. Empty if no EXIF found.
        """
        metadata: Dict[str, Any] = {}

        try:
            with open(file_path, "rb") as f:
                tags = exifread.process_file(f, details=False)

            if not tags:
                logger.info(f"No EXIF metadata found in {file_path}")
                return {}

            # Camera info
            metadata["make"] = self._tag_val(tags, "Image Make")
            metadata["model"] = self._tag_val(tags, "Image Model")
            metadata["lens"] = self._tag_val(tags, "EXIF LensModel") or self._tag_val(tags, "EXIF LensMake")
            metadata["software"] = self._tag_val(tags, "Image Software")
            metadata["author"] = self._tag_val(tags, "Image Artist") or self._tag_val(tags, "EXIF Artist")

            # Dates
            metadata["date_taken"] = self._tag_val(tags, "EXIF DateTimeOriginal") or self._tag_val(tags, "Image DateTime")
            metadata["date_modified"] = self._tag_val(tags, "Image DateTime")

            # Image settings
            metadata["orientation"] = self._tag_val(tags, "Image Orientation")
            metadata["color_space"] = self._tag_val(tags, "EXIF ColorSpace")
            metadata["exposure_time"] = self._tag_val(tags, "EXIF ExposureTime")
            metadata["f_number"] = self._tag_val(tags, "EXIF FNumber")
            metadata["iso"] = self._tag_val(tags, "EXIF ISOSpeedRatings")
            metadata["focal_length"] = self._tag_val(tags, "EXIF FocalLength")
            metadata["flash"] = self._tag_val(tags, "EXIF Flash")
            metadata["white_balance"] = self._tag_val(tags, "EXIF WhiteBalance")
            metadata["resolution_x"] = self._tag_val(tags, "Image XResolution")
            metadata["resolution_y"] = self._tag_val(tags, "Image YResolution")

            # GPS
            gps = self._parse_gps(tags)
            if gps:
                metadata["gps"] = gps

            # Has thumbnail?
            metadata["has_thumbnail"] = "JPEGThumbnail" in tags

            # Remove None values
            metadata = {k: v for k, v in metadata.items() if v is not None}

        except Exception as e:
            logger.error(f"EXIF extraction failed for {file_path}: {e}")

        return metadata

    def _tag_val(self, tags: dict, key: str) -> Optional[str]:
        """Safely extract a tag value as string."""
        tag = tags.get(key)
        if tag is None:
            return None
        val = str(tag).strip()
        return val if val and val != "0" else None

    def _parse_gps(self, tags: dict) -> Optional[Dict[str, Any]]:
        """
        Parse GPS IFD tags into decimal degree coordinates.

        Returns:
            Dict with lat, lng, altitude, or None if no GPS data
        """
        gps_lat = tags.get("GPS GPSLatitude")
        gps_lat_ref = tags.get("GPS GPSLatitudeRef")
        gps_lng = tags.get("GPS GPSLongitude")
        gps_lng_ref = tags.get("GPS GPSLongitudeRef")

        if not all([gps_lat, gps_lat_ref, gps_lng, gps_lng_ref]):
            return None

        try:
            lat = self._dms_to_decimal(gps_lat.values, str(gps_lat_ref))
            lng = self._dms_to_decimal(gps_lng.values, str(gps_lng_ref))

            gps_data: Dict[str, Any] = {
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "maps_url": f"https://maps.google.com/?q={lat},{lng}",
            }

            alt_tag = tags.get("GPS GPSAltitude")
            if alt_tag:
                try:
                    gps_data["altitude"] = float(alt_tag.values[0])
                except Exception:
                    pass

            return gps_data
        except Exception as e:
            logger.warning(f"GPS parsing failed: {e}")
            return None

    def _dms_to_decimal(self, dms_values: list, ref: str) -> float:
        """Convert degrees/minutes/seconds to decimal degrees."""
        d = float(dms_values[0])
        m = float(dms_values[1]) / 60.0
        s = float(dms_values[2]) / 3600.0
        decimal = d + m + s
        if ref in ("S", "W"):
            decimal = -decimal
        return decimal

    def _calc_aspect_ratio(self, w: int, h: int) -> str:
        """Calculate human-readable aspect ratio (e.g. '16:9')."""
        if h == 0:
            return "N/A"
        g = math.gcd(w, h)
        return f"{w // g}:{h // g}"

    def _format_size(self, size_bytes: int) -> str:
        """Format bytes to human readable."""
        for unit in ["B", "KB", "MB", "GB"]:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} TB"
