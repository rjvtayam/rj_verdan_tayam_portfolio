from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.ratelimit import rate_limit
from app.db import get_db
from app.models import Project, ProjectVote, Tag
from app.schemas import ProjectOut, VoteRequest, VoteResult

router = APIRouter()


async def vote_stats(db: AsyncSession) -> dict[int, tuple[float, int]]:
    rows = await db.execute(
        select(
            ProjectVote.project_id,
            func.avg(ProjectVote.value),
            func.count(ProjectVote.id),
        ).group_by(ProjectVote.project_id)
    )
    return {pid: (float(avg or 0.0), int(count)) for pid, avg, count in rows.all()}


def serialize_project(project: Project, stats: dict[int, tuple[float, int]]) -> ProjectOut:
    out = ProjectOut.model_validate(project)
    avg, count = stats.get(project.id, (0.0, 0))
    out.rating_avg = round(avg, 2)
    out.rating_count = count
    return out


@router.get("", response_model=list[ProjectOut])
async def list_projects(
    tag: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[ProjectOut]:
    query = select(Project).where(Project.status == "published").order_by(Project.created_at.desc())
    if featured is not None:
        query = query.where(Project.featured == featured)
    if tag:
        query = query.join(Project.tags).where(Tag.name == tag.lower())
    result = await db.execute(query)
    projects = list(result.unique().scalars().all())
    stats = await vote_stats(db)
    return [serialize_project(p, stats) for p in projects]


@router.get("/{slug}", response_model=ProjectOut)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)) -> ProjectOut:
    result = await db.execute(select(Project).where(Project.slug == slug, Project.status == "published"))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    stats = await vote_stats(db)
    return serialize_project(project, stats)


@router.post("/{project_id}/vote", response_model=VoteResult, status_code=status.HTTP_201_CREATED)
async def vote_project(
    project_id: int,
    body: VoteRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> VoteResult:
    rate_limit(request, "votes", settings.RATE_LIMIT_VOTES_PER_HOUR)
    project = await db.get(Project, project_id)
    if project is None or project.status != "published":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    existing = (
        await db.execute(
            select(ProjectVote).where(
                ProjectVote.project_id == project_id,
                ProjectVote.visitor_id == body.visitor_id,
            )
        )
    ).scalar_one_or_none()

    if existing is None:
        db.add(ProjectVote(project_id=project_id, visitor_id=body.visitor_id, value=body.value))
    else:
        existing.value = body.value
    await db.commit()

    stats = await vote_stats(db)
    avg, count = stats.get(project_id, (0.0, 0))
    return VoteResult(rating_avg=round(avg, 2), rating_count=count, my_vote=body.value)
