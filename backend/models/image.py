"""
SQLAlchemy Image model for StegInspector.
Represents uploaded image files awaiting analysis.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class Image(Base):
    """Uploaded image file model."""

    __tablename__ = "images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # File info
    filename: Mapped[str] = mapped_column(String(255), nullable=False)       # UUID-based stored name
    original_name: Mapped[str] = mapped_column(String(500), nullable=False)  # Original upload name
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)     # Absolute path on disk
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)       # Bytes
    mime_type: Mapped[str] = mapped_column(String(100), nullable=True)
    extension: Mapped[str] = mapped_column(String(20), nullable=False)

    # Image dimensions
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Status: pending | processing | completed | failed
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)

    # Timestamps
    upload_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    analysis_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="images")  # noqa: F821
    analysis: Mapped[Optional["AnalysisResult"]] = relationship(  # noqa: F821
        "AnalysisResult", back_populates="image", uselist=False
    )
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="image")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Image id={self.id} name={self.original_name} status={self.status}>"
