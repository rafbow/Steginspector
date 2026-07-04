"""
Image upload and retrieval business logic — no-auth mode.
"""
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from repository.image_repo import create_image, get_image_by_id, get_all_images
from upload.file_handler import FileHandler

ANON_USER_ID = 1  # single workspace, no per-user isolation


async def upload_image(db: AsyncSession, upload: UploadFile):
    file_data = await FileHandler().save_upload(upload)
    return await create_image(db=db, user_id=ANON_USER_ID, **file_data)


async def get_image_or_404(db: AsyncSession, image_id: int):
    image = await get_image_by_id(db, image_id)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return image


async def list_all_images(db: AsyncSession):
    return await get_all_images(db)
