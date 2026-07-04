"""
PDF forensic report generation.
"""
from pathlib import Path
from typing import Any, Dict
from uuid import uuid4
import textwrap

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from config import settings
from utils.file_utils import ensure_directory


class PDFReportGenerator:
    """Generates a compact PDF report from analysis data."""

    def generate(self, image, results: Dict[str, Any]) -> Dict[str, str]:
        ensure_directory(settings.REPORTS_DIR)
        filename = f"steginspector-{image.id}-{uuid4().hex[:8]}.pdf"
        path = str((Path(settings.REPORTS_DIR).resolve() / filename))

        doc = SimpleDocTemplate(path, pagesize=A4, title=f"StegInspector Report {image.id}")
        styles = getSampleStyleSheet()
        story = [
            Paragraph("StegInspector Forensic Report", styles["Title"]),
            Spacer(1, 12),
            Paragraph(f"Image: {image.original_name}", styles["Heading2"]),
            Paragraph(f"Status: {image.status}", styles["Normal"]),
            Paragraph(
                f"Risk: {results.get('risk_level', 'Unknown')} "
                f"({results.get('risk_score', 0)}/100)",
                styles["Normal"],
            ),
            Spacer(1, 12),
        ]

        image_info = results.get("image_info") or {}
        hashes = results.get("hashes") or {}
        entropy = results.get("entropy_data") or {}
        signature = results.get("signature_data") or {}
        risk = results.get("risk_details") or {}

        story.append(Paragraph("File Information", styles["Heading2"]))
        story.append(self._table([
            ["Original name", image.original_name],
            ["Stored name", image.filename],
            ["Size", image_info.get("size_formatted", image.file_size)],
            ["Dimensions", image_info.get("resolution", "Unknown")],
            ["MIME", image.mime_type or image_info.get("mime_type", "Unknown")],
            ["Uploaded", str(image.upload_date)],
        ]))
        story.append(Spacer(1, 12))

        story.append(Paragraph("Hashes", styles["Heading2"]))
        story.append(self._table([[key.upper(), value] for key, value in hashes.items()]))
        story.append(Spacer(1, 12))

        story.append(Paragraph("Analysis Summary", styles["Heading2"]))
        story.append(self._table([
            ["Entropy", f"{entropy.get('value', 0)} - {entropy.get('level', 'Unknown')}"],
            ["Signature", "Mismatch" if signature.get("mismatch") else "OK"],
            ["LSB", (results.get("lsb_results") or {}).get("hidden_data_probability", "Unknown")],
            ["Summary", risk.get("summary", "No risk summary available.")],
        ]))
        story.append(Spacer(1, 12))

        factors = risk.get("factors") or []
        if factors:
            story.append(Paragraph("Risk Factors", styles["Heading2"]))
            rows = [["Factor", "Points", "Triggered", "Description"]]
            for factor in factors:
                rows.append([
                    factor.get("name", ""),
                    str(factor.get("points", "")),
                    "Yes" if factor.get("triggered") else "No",
                    self._wrap(factor.get("description", ""), 42),
                ])
            story.append(self._table(rows, header=True))

        doc.build(story)
        return {"pdf_path": path, "pdf_filename": filename}

    def _table(self, rows, header: bool = False):
        table = Table(rows, hAlign="LEFT", colWidths=None)
        style = [
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]
        if header:
            style.append(("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey))
            style.append(("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"))
        table.setStyle(TableStyle(style))
        return table

    def _wrap(self, value: str, width: int) -> str:
        return "\n".join(textwrap.wrap(str(value), width=width))
