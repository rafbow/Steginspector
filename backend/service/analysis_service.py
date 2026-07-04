"""
Steganography analysis orchestration.
"""
from datetime import datetime
from typing import Any, Dict, Optional
import json
import traceback

from sqlalchemy.ext.asyncio import AsyncSession

from analysis.bit_plane_analyzer import BitPlaneAnalyzer
from analysis.channel_viewer import ChannelViewer
from analysis.entropy_calculator import EntropyCalculator
from analysis.hash_calculator import HashCalculator
from analysis.histogram_generator import HistogramGenerator
from analysis.lsb_analyzer import LSBAnalyzer
from analysis.metadata_extractor import MetadataExtractor
from analysis.risk_assessor import RiskAssessor
from analysis.signature_verifier import SignatureVerifier
from analysis.strings_extractor import StringsExtractor
from database import AsyncSessionLocal
from repository.analysis_repo import create_analysis, get_analysis_by_image, update_analysis
from repository.image_repo import get_image_by_id, update_image_status
from utils.logger import get_logger

logger = get_logger(__name__)


JSON_FIELDS = [
    "image_info",
    "hashes",
    "metadata_exif",
    "histogram_data",
    "channels_data",
    "alpha_data",
    "bit_planes_data",
    "lsb_results",
    "strings_data",
    "entropy_data",
    "signature_data",
    "risk_details",
]


async def ensure_analysis_record(db: AsyncSession, image_id: int):
    analysis = await get_analysis_by_image(db, image_id)
    if analysis:
        return analysis
    return await create_analysis(db, image_id)


async def run_analysis_background(image_id: int) -> None:
    async with AsyncSessionLocal() as db:
        try:
            await run_analysis(db, image_id)
            await db.commit()
        except Exception as exc:
            await db.rollback()
            logger.error(f"Background analysis crashed for image {image_id}: {exc}")
            logger.debug(traceback.format_exc())


async def run_analysis(db: AsyncSession, image_id: int):
    image = await get_image_by_id(db, image_id)
    if not image:
        raise ValueError(f"Image {image_id} not found")

    analysis = await ensure_analysis_record(db, image_id)
    await update_image_status(db, image_id, "processing")
    await update_analysis(db, analysis.id, progress=5, error_message=None)
    await db.commit()

    try:
        file_path = image.file_path
        metadata = MetadataExtractor()

        image_info = metadata.get_image_info(file_path)
        await _update_step(db, analysis.id, 12, image_info=image_info)

        hashes = HashCalculator().calculate_all(file_path)
        await _update_step(db, analysis.id, 22, hashes=hashes)

        metadata_exif = metadata.extract(file_path)
        await _update_step(db, analysis.id, 32, metadata_exif=metadata_exif)

        histogram_data = HistogramGenerator().generate(file_path)
        await _update_step(db, analysis.id, 43, histogram_data=histogram_data)

        channel_viewer = ChannelViewer()
        channels_data = channel_viewer.generate(file_path)
        alpha_data = channel_viewer.alpha_info(file_path)
        await _update_step(
            db,
            analysis.id,
            54,
            channels_data=channels_data,
            alpha_data=alpha_data,
        )

        bit_planes_data = BitPlaneAnalyzer().analyze(file_path)
        await _update_step(db, analysis.id, 65, bit_planes_data=bit_planes_data)

        lsb_results = LSBAnalyzer().analyze(file_path)
        await _update_step(db, analysis.id, 75, lsb_results=lsb_results)

        strings_data = StringsExtractor().extract(file_path)
        entropy_data = EntropyCalculator().calculate(file_path)
        signature_data = SignatureVerifier().verify(file_path)
        await _update_step(
            db,
            analysis.id,
            88,
            strings_data=strings_data,
            entropy_data=entropy_data,
            signature_data=signature_data,
        )

        risk_details = RiskAssessor().assess(
            entropy_data=entropy_data,
            lsb_results=lsb_results,
            signature_data=signature_data,
            strings_data=strings_data,
            metadata_exif=metadata_exif,
            alpha_data=alpha_data,
        )

        await update_analysis(
            db,
            analysis.id,
            risk_score=risk_details["score"],
            risk_level=risk_details["level"],
            risk_details=json.dumps(risk_details),
            progress=100,
            error_message=None,
        )
        await update_image_status(db, image_id, "completed", analysis_date=datetime.utcnow())
        await db.commit()
        logger.info(f"Analysis completed for image {image_id}")
    except Exception as exc:
        logger.error(f"Analysis failed for image {image_id}: {exc}")
        await update_analysis(db, analysis.id, progress=100, error_message=str(exc))
        await update_image_status(db, image_id, "failed", analysis_date=datetime.utcnow())
        await db.commit()
        raise


async def _update_step(db: AsyncSession, analysis_id: int, progress: int, **kwargs):
    serializable = {
        key: json.dumps(value)
        for key, value in kwargs.items()
        if key in JSON_FIELDS
    }
    serializable["progress"] = progress
    await update_analysis(db, analysis_id, **serializable)
    await db.commit()


def serialize_analysis(analysis, image_status: Optional[str] = None) -> Dict[str, Any]:
    if not analysis:
        return {
            "image_id": 0,
            "status": image_status or "pending",
            "progress": 0,
            "risk_score": 0,
            "risk_level": "Unknown",
        }

    data: Dict[str, Any] = {
        "image_id": analysis.image_id,
        "status": image_status or "completed",
        "progress": analysis.progress,
        "risk_score": analysis.risk_score,
        "risk_level": analysis.risk_level,
        "error_message": analysis.error_message,
    }
    for field in JSON_FIELDS:
        data[field] = _loads(getattr(analysis, field))
    return data


def _loads(value: Optional[str]):
    if not value:
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None
