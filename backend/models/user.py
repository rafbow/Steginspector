"""
SQLAlchemy User model for StegInspector.
Represents investigator and admin accounts.
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


class User(Base):
    """User account model with role-based access control."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="investigator", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    images: Mapped[List["Image"]] = relationship("Image", back_populates="user", lazy="select")  # noqa: F821
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="user", lazy="select")  # noqa: F821
    logs: Mapped[List["Log"]] = relationship("Log", back_populates="user", lazy="select")  # noqa: F821

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
