"""
Entropy calculator for byte-level randomness analysis.
"""
from math import log2
from typing import Any, Dict

import numpy as np

from utils.logger import get_logger

logger = get_logger(__name__)


class EntropyCalculator:
    """Calculates Shannon entropy for a file."""

    def calculate(self, file_path: str) -> Dict[str, Any]:
        """
        Calculate byte entropy on a 0-8 scale.

        High entropy is common in compressed image formats, but very high values
        combined with other signals can indicate packed or embedded data.
        """
        try:
            with open(file_path, "rb") as f:
                data = f.read()
        except Exception as exc:
            logger.error(f"Entropy calculation failed for {file_path}: {exc}")
            return self._result(0.0)

        if not data:
            return self._result(0.0)

        counts = np.bincount(np.frombuffer(data, dtype=np.uint8), minlength=256)
        probabilities = counts[counts > 0] / len(data)
        entropy = float(-np.sum(probabilities * np.log2(probabilities)))
        return self._result(round(entropy, 4))

    def _result(self, value: float) -> Dict[str, Any]:
        if value >= 7.8:
            level = "High"
            interpretation = "Very high randomness"
            description = "The file has byte distribution close to random or compressed data."
        elif value >= 6.5:
            level = "Medium"
            interpretation = "Moderate randomness"
            description = "The file has typical compressed-image entropy."
        else:
            level = "Low"
            interpretation = "Low randomness"
            description = "The file contains repeated or structured byte patterns."

        return {
            "value": value,
            "interpretation": interpretation,
            "level": level,
            "gauge_percentage": round((value / 8.0) * 100, 2),
            "description": description,
        }
