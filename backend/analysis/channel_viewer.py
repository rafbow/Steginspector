"""
Channel visualization helpers.
"""
from io import BytesIO
from typing import Any, Dict
import base64

import numpy as np
from PIL import Image as PILImage

from utils.logger import get_logger

logger = get_logger(__name__)


class ChannelViewer:
    """Creates compact PNG previews for color and alpha channels."""

    def generate(self, file_path: str, max_size: int = 512) -> Dict[str, str]:
        try:
            with PILImage.open(file_path) as img:
                rgba = img.convert("RGBA")
                rgba.thumbnail((max_size, max_size))
                arr = np.asarray(rgba)
        except Exception as exc:
            logger.error(f"Channel preview failed for {file_path}: {exc}")
            return {}

        previews: Dict[str, str] = {
            "red": self._channel_png(arr, 0),
            "green": self._channel_png(arr, 1),
            "blue": self._channel_png(arr, 2),
        }

        alpha = arr[:, :, 3]
        if np.any(alpha < 255):
            previews["alpha"] = self._gray_png(alpha)

        return previews

    def alpha_info(self, file_path: str) -> Dict[str, Any]:
        try:
            with PILImage.open(file_path) as img:
                if "A" not in img.getbands():
                    return {"has_alpha": False, "transparent_pixels": 0, "percentage": 0.0}
                arr = np.asarray(img.convert("RGBA"))[:, :, 3]
        except Exception as exc:
            logger.error(f"Alpha inspection failed for {file_path}: {exc}")
            return {"has_alpha": False, "transparent_pixels": 0, "percentage": 0.0}

        transparent = int(np.count_nonzero(arr < 255))
        total = int(arr.size)
        return {
            "has_alpha": True,
            "transparent_pixels": transparent,
            "percentage": round((transparent / total) * 100, 2) if total else 0.0,
        }

    def _channel_png(self, arr: np.ndarray, channel_index: int) -> str:
        out = np.zeros_like(arr[:, :, :3])
        out[:, :, channel_index] = arr[:, :, channel_index]
        return self._image_to_data_url(PILImage.fromarray(out, "RGB"))

    def _gray_png(self, arr: np.ndarray) -> str:
        return self._image_to_data_url(PILImage.fromarray(arr.astype(np.uint8), "L"))

    def _image_to_data_url(self, image: PILImage.Image) -> str:
        buffer = BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/png;base64,{encoded}"
