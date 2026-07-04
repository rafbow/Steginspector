"""
Bit-plane visualization for grayscale image data.
"""
from io import BytesIO
from typing import Dict
import base64

import numpy as np
from PIL import Image as PILImage

from utils.logger import get_logger

logger = get_logger(__name__)


class BitPlaneAnalyzer:
    """Extracts visual previews for bit planes 0 through 7."""

    def analyze(self, file_path: str, max_size: int = 512) -> Dict[str, str]:
        try:
            with PILImage.open(file_path) as img:
                gray = img.convert("L")
                gray.thumbnail((max_size, max_size))
                arr = np.asarray(gray)
        except Exception as exc:
            logger.error(f"Bit-plane analysis failed for {file_path}: {exc}")
            return {}

        planes: Dict[str, str] = {}
        for bit in range(8):
            plane = ((arr >> bit) & 1) * 255
            planes[f"bit_{bit}"] = self._png_data_url(plane.astype(np.uint8))
        return planes

    def _png_data_url(self, arr: np.ndarray) -> str:
        image = PILImage.fromarray(arr, "L")
        buffer = BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        return f"data:image/png;base64,{encoded}"
