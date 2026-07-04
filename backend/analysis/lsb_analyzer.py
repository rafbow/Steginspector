"""
Least Significant Bit statistical analysis.
"""
from typing import Any, Dict

import numpy as np
from PIL import Image as PILImage
from scipy.stats import chisquare

from utils.logger import get_logger

logger = get_logger(__name__)


class LSBAnalyzer:
    """Analyzes LSB distribution and simple randomness indicators."""

    def analyze(self, file_path: str) -> Dict[str, Any]:
        try:
            with PILImage.open(file_path) as img:
                arr = np.asarray(img.convert("RGB"))
        except Exception as exc:
            logger.error(f"LSB analysis failed for {file_path}: {exc}")
            return self._empty()

        channels = {"red": arr[:, :, 0], "green": arr[:, :, 1], "blue": arr[:, :, 2]}
        density: Dict[str, float] = {}
        chi: Dict[str, Any] = {}
        patterns: Dict[str, str] = {}
        p_values = []

        for name, channel in channels.items():
            lsb = (channel.flatten() & 1).astype(np.uint8)
            ones = int(np.count_nonzero(lsb))
            zeros = int(lsb.size - ones)
            density[name] = round((ones / lsb.size) * 100, 2) if lsb.size else 0.0

            try:
                statistic, p_value = chisquare([zeros, ones])
                chi[name] = {
                    "zeros": zeros,
                    "ones": ones,
                    "statistic": round(float(statistic), 4),
                    "p_value": round(float(p_value), 6),
                }
                p_values.append(float(p_value))
            except Exception:
                chi[name] = {"zeros": zeros, "ones": ones, "statistic": 0.0, "p_value": 0.0}

            patterns[name] = "".join(str(int(v)) for v in lsb[:128])

        avg_p = sum(p_values) / len(p_values) if p_values else 0.0
        randomness_score = round(avg_p * 100, 2)
        balanced_channels = sum(45.0 <= value <= 55.0 for value in density.values())
        suspicious = balanced_channels >= 2 and randomness_score >= 35.0

        if suspicious:
            probability = "Medium"
            statistical_result = "LSB distribution is unusually balanced across channels."
        elif balanced_channels:
            probability = "Low"
            statistical_result = "One or more channels have balanced LSB distribution."
        else:
            probability = "Very Low"
            statistical_result = "No strong LSB distribution anomaly detected."

        return {
            "lsb_density": density,
            "chi_square": chi,
            "randomness_score": randomness_score,
            "hidden_data_probability": probability,
            "statistical_result": statistical_result,
            "bit_pattern": patterns,
            "suspicious": suspicious,
        }

    def _empty(self) -> Dict[str, Any]:
        return {
            "lsb_density": {},
            "chi_square": {},
            "randomness_score": 0.0,
            "hidden_data_probability": "Unknown",
            "statistical_result": "Unable to analyze LSB data.",
            "bit_pattern": {},
            "suspicious": False,
        }
