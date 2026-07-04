"""
SQLAlchemy models for analysis results, reports, and audit logs.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class AnalysisResult(Base):
    """
    Stores all analysis results for a given image.
    Each image has at most one AnalysisResult (enforced by unique constraint).
    All complex data is stored as JSON strings.
    """

    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    image_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("images.id"), nullable=False, unique=True, index=True
    )

    # Analysis data stored as JSON strings
    image_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hashes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_exif: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    histogram_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    channels_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    alpha_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bit_planes_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lsb_results: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    strings_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entropy_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    signature_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Risk assessment
    risk_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), default="Unknown", nullable=False)
    risk_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Progress tracking
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    image: Mapped["Image"] = relationship("Image", back_populates="analysis")  # noqa: F821

    def __repr__(self) -> str:
        return f"<AnalysisResult image_id={self.image_id} risk={self.risk_score} progress={self.progress}>"


class Report(Base):
    """Generated PDF forensic report for an analyzed image."""

    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    image_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("images.id"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    pdf_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    pdf_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    image: Mapped["Image"] = relationship("Image", back_populates="reports")  # noqa: F821
    user: Mapped["User"] = relationship("User", back_populates="reports")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Report id={self.id} image_id={self.image_id}>"


class Log(Base):
    """Audit log for user actions."""

    __tablename__ = "logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(500), nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="logs")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Log id={self.id} user_id={self.user_id} action={self.action}>"
