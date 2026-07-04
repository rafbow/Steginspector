"""
Risk scoring for steganography indicators.
"""
from typing import Any, Dict, List


class RiskAssessor:
    """Combines independent analysis signals into a 0-100 risk score."""

    def assess(
        self,
        *,
        entropy_data: Dict[str, Any],
        lsb_results: Dict[str, Any],
        signature_data: Dict[str, Any],
        strings_data: Dict[str, Any],
        metadata_exif: Dict[str, Any],
        alpha_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        factors: List[Dict[str, Any]] = []

        entropy = float(entropy_data.get("value") or 0.0)
        factors.append(self._factor(
            "High entropy",
            20,
            entropy >= 7.8,
            "Byte entropy is close to random or compressed data.",
        ))

        factors.append(self._factor(
            "Suspicious LSB distribution",
            30,
            bool(lsb_results.get("suspicious")),
            "Least significant bits are unusually balanced across channels.",
        ))

        factors.append(self._factor(
            "Signature mismatch",
            25,
            bool(signature_data.get("mismatch")),
            "File extension, magic number, or MIME type does not align.",
        ))

        interesting_strings = [
            item for item in strings_data.get("strings", [])
            if item.get("type") in {"url", "email", "base64", "hex"}
        ]
        factors.append(self._factor(
            "Embedded structured strings",
            10,
            len(interesting_strings) > 0,
            "The file contains URLs, emails, base64, or long hexadecimal strings.",
        ))

        factors.append(self._factor(
            "No EXIF metadata",
            5,
            not bool(metadata_exif),
            "Missing EXIF metadata can be normal but is worth reviewing.",
        ))

        factors.append(self._factor(
            "Alpha transparency data",
            10,
            bool(alpha_data.get("has_alpha")) and float(alpha_data.get("percentage") or 0) > 0,
            "Transparent pixels can be used to hide visual information.",
        ))

        score = min(100, sum(factor["points"] for factor in factors if factor["triggered"]))
        if score >= 60:
            level = "Suspicious"
        elif score >= 25:
            level = "Needs Review"
        else:
            level = "Safe"

        return {
            "score": score,
            "level": level,
            "factors": factors,
            "summary": self._summary(level, score),
        }

    def _factor(self, name: str, points: int, triggered: bool, description: str) -> Dict[str, Any]:
        return {
            "name": name,
            "points": points,
            "triggered": triggered,
            "description": description,
        }

    def _summary(self, level: str, score: int) -> str:
        if level == "Suspicious":
            return f"Risk score {score}/100. Multiple steganography indicators require investigation."
        if level == "Needs Review":
            return f"Risk score {score}/100. Some indicators are present and should be reviewed."
        return f"Risk score {score}/100. No strong steganography indicators were detected."
