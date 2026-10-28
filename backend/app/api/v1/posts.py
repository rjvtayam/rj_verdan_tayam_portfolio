from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Post
from app.schemas import PostListOut, PostOut, reading_minutes

router = APIRouter()


def _published_filter(query):
    return query.where(Post.status == "published")


@router.get("", response_model=list[PostListOut])
async def list_posts(
    project: str | None = None,
    level: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[PostListOut]:
    """List published posts (slim: no content_md), anchored to a project and/or level."""
    query = _published_filter(select(Post))
    if project:
        query = query.where(Post.project_slug == project)
    if level:
        query = query.where(Post.level == level)
    query = query.order_by(Post.published_at.desc().nullslast())
    result = await db.execute(query)
    # content_md is loaded (needed to compute reading time with the exact
    # frontend algorithm) but excluded from the payload — lists shrank ~8x.
    return [
        PostListOut(
            id=p.id,
            slug=p.slug,
            title=p.title,
            excerpt=p.excerpt,
            tags=p.tags,
            project_slug=p.project_slug,
            level=p.level,
            status=p.status,
            published_at=p.published_at,
            created_at=p.created_at,
            reading_minutes=reading_minutes(p.content_md),
        )
        for p in result.scalars().all()
    ]


@router.get("/{slug}", response_model=PostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)) -> Post:
    query = _published_filter(select(Post).where(Post.slug == slug))
    result = await db.execute(query)
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post
