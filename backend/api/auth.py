"""
Authentication API routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import Token, UserCreate, UserLogin, UserResponse
from service.auth_service import authenticate_user, build_token_for_user, register_user
from utils.jwt_utils import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await register_user(db, payload)
    return {"access_token": build_token_for_user(user), "user": user}


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, payload.email, payload.password)
    return {"access_token": build_token_for_user(user), "user": user}


@router.get("/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    return current_user
