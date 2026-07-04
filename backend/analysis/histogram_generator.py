"""
Histogram generation for RGB and grayscale channels.
"""
from typing import Any, Dict, List

import numpy as np
from PIL import Image as PILImage

from utils.logger import get_logger

logger = get_logger(__name__)


class HistogramGenerator:
    """Generates per-channel histogram data for image visualization."""

    def generate(self, file_path: str) -> Dict[str, Any]:
        try:
            with PILImage.open(file_path) as img:
                rgb = img.convert("RGB")
                arr = np.asarray(rgb)
                gray = np.asarray(rgb.convert("L"))
        except Exception as exc:
            logger.error(f"Histogram generation failed for {file_path}: {exc}")
            return {"red": [], "green": [], "blue": [], "grayscale": []}

        return {
            "red": self._hist(arr[:, :, 0]),
            "green": self._hist(arr[:, :, 1]),
            "blue": self._hist(arr[:, :, 2]),
            "grayscale": self._hist(gray),
        }

    def _hist(self, channel: np.ndarray) -> List[int]:
        return np.bincount(channel.flatten(), minlength=256).astype(int).tolist()
