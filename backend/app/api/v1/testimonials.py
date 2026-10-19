from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.ratelimit import rate_limit
from app.core.uploads import save_avatar
from app.db import get_db
from app.models import Testimonial
from app.schemas import TestimonialOut

router = APIRouter()


@router.get("", response_model=list[TestimonialOut])
async def list_testimonials(db: AsyncSession = Depends(get_db)) -> list[Testimonial]:
    result = await db.execute(
        select(Testimonial)
        .where(Testimonial.status == "published")
        .order_by(Testimonial.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=TestimonialOut, status_code=status.HTTP_201_CREATED)
async def create_testimonial(
    request: Request,
    name: str = Form(..., min_length=2, max_length=200),
    role: str = Form("", max_length=200),
    quote: str = Form(..., min_length=10, max_length=2000),
    rating: int = Form(..., ge=1, le=5),
    avatar: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
) -> Testimonial:
    rate_limit(request, "testimonials", limit=settings.RATE_LIMIT_MESSAGES_PER_HOUR)

    avatar_url = None
    if avatar is not None and avatar.filename:
        avatar_url = await save_avatar(avatar)

    testimonial = Testimonial(
        name=name.strip(),
        role=role.strip(),
        quote=quote.strip(),
        rating=rating,
        avatar_url=avatar_url,
    )
    db.add(testimonial)
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


@router.get("/{testimonial_id}", response_model=TestimonialOut)
async def get_testimonial(testimonial_id: int, db: AsyncSession = Depends(get_db)) -> Testimonial:
    testimonial = await db.get(Testimonial, testimonial_id)
    if testimonial is None or testimonial.status != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Testimonial not found")
    return testimonial
