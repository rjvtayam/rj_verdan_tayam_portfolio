from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_admin
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.db import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == body.email.lower()))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(user.password_hash, body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    uid = str(user.id)
    return TokenResponse(
        access_token=create_access_token(uid, user.role),
        refresh_token=create_refresh_token(uid, user.role),
        role=user.role,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(credentials: str, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    payload = decode_token(credentials)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user = await db.get(User, int(payload["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    uid = str(user.id)
    # Rotate the refresh token so a stolen one has a bounded useful life.
    return TokenResponse(
        access_token=create_access_token(uid, user.role),
        refresh_token=create_refresh_token(uid, user.role),
        role=user.role,
    )


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.get("/admin-check", response_model=UserOut)
async def admin_check(user: User = Depends(require_admin)) -> User:
    return user
