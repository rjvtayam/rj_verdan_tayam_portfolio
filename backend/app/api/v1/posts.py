from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Post
from app.schemas import PostOut

router = APIRouter()


def _published_filter(query):
    return query.where(Post.status == "published")


@router.get("", response_model=list[PostOut])
async def list_posts(db: AsyncSession = Depends(get_db)) -> list[Post]:
    query = _published_filter(select(Post)).order_by(Post.published_at.desc().nullslast())
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{slug}", response_model=PostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)) -> Post:
    query = _published_filter(select(Post).where(Post.slug == slug))
    result = await db.execute(query)
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post
