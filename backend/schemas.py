"""
Pydantic schemas for request/response models in StegInspector API.
All input validation and output serialization is defined here.
"""
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, field_validator


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: str
    password: str
    full_name: str
    role: str = "investigator"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("admin", "investigator"):
            raise ValueError("Role must be 'admin' or 'investigator'")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str


class UserResponse(BaseModel):
    """Schema for returning user data (no password)."""
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Data encoded inside JWT."""
    user_id: Optional[int] = None
    email: Optional[str] = None


# ─── Image Schemas ────────────────────────────────────────────────────────────

class ImageResponse(BaseModel):
    """Schema for returning image data."""
    id: int
    filename: str
    original_name: str
    file_size: int
    mime_type: Optional[str]
    extension: str
    width: Optional[int]
    height: Optional[int]
    status: str
    upload_date: datetime
    analysis_date: Optional[datetime]

    class Config:
        from_attributes = True


class ImageUploadResult(BaseModel):
    """Result of a single image upload."""
    id: int
    filename: str
    original_name: str
    status: str
    message: str = "Uploaded successfully"


# ─── Analysis Schemas ─────────────────────────────────────────────────────────

class AnalysisStatusResponse(BaseModel):
    """Analysis progress status response."""
    image_id: int
    status: str
    progress: int
    message: str


class HashData(BaseModel):
    md5: str
    sha1: str
    sha256: str
    sha512: str
    crc32: str


class EntropyData(BaseModel):
    value: float
    interpretation: str
    level: str
    gauge_percentage: float
    description: str


class LSBData(BaseModel):
    lsb_density: Dict[str, float]
    chi_square: Dict[str, Any]
    randomness_score: float
    hidden_data_probability: str
    statistical_result: str
    bit_pattern: Dict[str, str]
    suspicious: bool


class SignatureData(BaseModel):
    magic_number: str
    expected_magic: str
    extension_match: bool
    mime_match: bool
    mismatch: bool
    warnings: List[str]
    detected_format: str


class RiskFactor(BaseModel):
    name: str
    points: int
    triggered: bool
    description: str


class RiskData(BaseModel):
    score: int
    level: str
    factors: List[RiskFactor]
    summary: str


class StringItem(BaseModel):
    value: str
    type: str
    offset: int


class StringsData(BaseModel):
    strings: List[StringItem]
    total: int
    by_type: Dict[str, int]


class AnalysisResultsResponse(BaseModel):
    """Full analysis results for an image."""
    image_id: int
    status: str
    progress: int
    image_info: Optional[Dict[str, Any]] = None
    hashes: Optional[Dict[str, str]] = None
    metadata_exif: Optional[Dict[str, Any]] = None
    histogram_data: Optional[Dict[str, Any]] = None
    channels_data: Optional[Dict[str, str]] = None
    alpha_data: Optional[Dict[str, Any]] = None
    bit_planes_data: Optional[Dict[str, str]] = None
    lsb_results: Optional[Dict[str, Any]] = None
    strings_data: Optional[Dict[str, Any]] = None
    entropy_data: Optional[Dict[str, Any]] = None
    signature_data: Optional[Dict[str, Any]] = None
    risk_score: int = 0
    risk_level: str = "Unknown"
    risk_details: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


# ─── Report Schemas ───────────────────────────────────────────────────────────

class ReportResponse(BaseModel):
    """Schema for report metadata."""
    id: int
    image_id: int
    pdf_filename: str
    created_at: datetime
    image_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Dashboard Schemas ────────────────────────────────────────────────────────

class RecentFileItem(BaseModel):
    id: int
    original_name: str
    status: str
    upload_date: datetime
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None


class DashboardStats(BaseModel):
    """Dashboard statistics response."""
    total_images: int
    today_analyses: int
    suspicious_files: int
    average_entropy: float
    recent_files: List[RecentFileItem]
    total_reports: int
    analyses_per_day: List[Dict[str, Any]]


# ─── History Schemas ──────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    """Single history entry."""
    id: int
    original_name: str
    extension: str
    file_size: int
    status: str
    upload_date: datetime
    analysis_date: Optional[datetime]
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None


class HistoryResponse(BaseModel):
    """Paginated history response."""
    items: List[HistoryItem]
    total: int
    page: int
    limit: int
    pages: int
