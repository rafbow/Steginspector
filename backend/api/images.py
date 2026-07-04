"""
Image upload and retrieval API routes — no-auth mode.
"""
from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import ImageResponse, ImageUploadResult
from service.image_service import get_image_or_404, list_all_images, upload_image
from repository.image_repo import delete_image

router = APIRouter(prefix="/api/images", tags=["images"])


@router.post("/upload", response_model=List[ImageUploadResult])
async def upload(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload one or more images."""
    results = []
    for file in files:
        image = await upload_image(db, file)
        await db.commit()
        results.append({
            "id": image.id,
            "filename": image.filename,
            "original_name": image.original_name,
            "status": image.status,
            "message": "Uploaded successfully",
        })
    return results


@router.get("/", response_model=List[ImageResponse])
async def list_images(db: AsyncSession = Depends(get_db)):
    """List all images in the workspace."""
    return await list_all_images(db)


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(image_id: int, db: AsyncSession = Depends(get_db)):
    return await get_image_or_404(db, image_id)


@router.delete("/{image_id}")
async def remove_image(image_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an image and its analysis records."""
    image = await get_image_or_404(db, image_id)
    deleted = await delete_image(db, image_id)
    await db.commit()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return {"message": f"Image {image_id} deleted"}
