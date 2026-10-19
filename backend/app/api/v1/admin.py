from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete as sa_delete
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.core.security import hash_password, verify_password
from app.db import get_db
from app.models import Experience, Message, Post, Project, ProjectTag, Skill, Tag, Testimonial, User
from app.schemas import (
    AdminStats,
    ExperienceCreate,
    ExperienceOut,
    ExperienceUpdate,
    MessageOut,
    MessagePatch,
    PostCreate,
    PostOut,
    PostUpdate,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    SkillCreate,
    SkillOut,
    SkillUpdate,
    TestimonialOut,
    TestimonialPatch,
    UserOut,
)

router = APIRouter(dependencies=[Depends(require_admin)])


async def _get_or_404(db: AsyncSession, model, obj_id: int):
    obj = await db.get(model, obj_id)
    if obj is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{model.__name__} not found")
    return obj


async def _unique_slug(db: AsyncSession, model, slug: str, exclude_id: int | None = None) -> None:
    query = select(model.id).where(model.slug == slug)
    if exclude_id is not None:
        query = query.where(model.id != exclude_id)
    result = await db.execute(query)
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")


async def _set_project_tags(db: AsyncSession, project: Project, names: list[str]) -> None:
    """Replace tags via association rows (never triggers async lazy loads)."""
    cleaned = {n.strip().lower() for n in names if n.strip()}
    tag_ids: list[int] = []
    for name in sorted(cleaned):
        result = await db.execute(select(Tag.id).where(Tag.name == name))
        tag_id = result.scalar_one_or_none()
        if tag_id is None:
            tag = Tag(name=name)
            db.add(tag)
            await db.flush()
            tag_id = tag.id
        tag_ids.append(tag_id)

    await db.execute(sa_delete(ProjectTag).where(ProjectTag.project_id == project.id))
    for tag_id in tag_ids:
        db.add(ProjectTag(project_id=project.id, tag_id=tag_id))
    await db.flush()


async def _reload_project(db: AsyncSession, project_id: int) -> Project:
    """Re-select so tags are eager-loaded before the session closes."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one()


async def _reload_post(db: AsyncSession, post_id: int) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    return result.scalar_one()


# ---------- stats ----------


@router.get("/stats", response_model=AdminStats)
async def stats(db: AsyncSession = Depends(get_db)) -> AdminStats:
    async def count(model, *where) -> int:
        query = select(func.count()).select_from(model)
        if where:
            query = query.where(*where)
        return (await db.execute(query)).scalar_one()

    return AdminStats(
        projects=await count(Project),
        published_projects=await count(Project, Project.status == "published"),
        posts=await count(Post),
        unread_messages=await count(Message, Message.is_read.is_(False)),
        messages=await count(Message),
        skills=await count(Skill),
        testimonials=await count(Testimonial),
    )


# ---------- projects ----------


@router.get("/projects", response_model=list[ProjectOut])
async def admin_list_projects(db: AsyncSession = Depends(get_db)) -> list[Project]:
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return list(result.scalars().all())


@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def admin_create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)) -> Project:
    await _unique_slug(db, Project, body.slug)
    data = body.model_dump(exclude={"tags"})
    project = Project(**data)
    project.slug = body.slug.lower()
    db.add(project)
    await db.flush()
    await _set_project_tags(db, project, body.tags)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug already exists")
    return await _reload_project(db, project.id)


@router.patch("/projects/{project_id}", response_model=ProjectOut)
async def admin_update_project(
    project_id: int, body: ProjectUpdate, db: AsyncSession = Depends(get_db)
) -> Project:
    project = await _get_or_404(db, Project, project_id)
    data = body.model_dump(exclude_unset=True, exclude={"tags"})
    if "slug" in data:
        await _unique_slug(db, Project, data["slug"], exclude_id=project_id)
        project.slug = data.pop("slug").lower()
    for key, value in data.items():
        setattr(project, key, value)
    if body.tags is not None:
        await _set_project_tags(db, project, body.tags)
    await db.commit()
    return await _reload_project(db, project_id)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_project(project_id: int, db: AsyncSession = Depends(get_db)) -> None:
    project = await _get_or_404(db, Project, project_id)
    await db.delete(project)
    await db.commit()


# ---------- posts ----------


@router.get("/posts", response_model=list[PostOut])
async def admin_list_posts(db: AsyncSession = Depends(get_db)) -> list[Post]:
    result = await db.execute(select(Post).order_by(Post.created_at.desc()))
    return list(result.scalars().all())


@router.post("/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def admin_create_post(body: PostCreate, db: AsyncSession = Depends(get_db)) -> Post:
    await _unique_slug(db, Post, body.slug)
    post = Post(**body.model_dump())
    post.slug = body.slug.lower()
    db.add(post)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug already exists")
    return await _reload_post(db, post.id)


@router.patch("/posts/{post_id}", response_model=PostOut)
async def admin_update_post(post_id: int, body: PostUpdate, db: AsyncSession = Depends(get_db)) -> Post:
    post = await _get_or_404(db, Post, post_id)
    data = body.model_dump(exclude_unset=True)
    if "slug" in data:
        await _unique_slug(db, Post, data["slug"], exclude_id=post_id)
        post.slug = data.pop("slug").lower()
    for key, value in data.items():
        setattr(post, key, value)
    await db.commit()
    return await _reload_post(db, post_id)


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_post(post_id: int, db: AsyncSession = Depends(get_db)) -> None:
    post = await _get_or_404(db, Post, post_id)
    await db.delete(post)
    await db.commit()


# ---------- skills ----------


@router.get("/skills", response_model=list[SkillOut])
async def admin_list_skills(db: AsyncSession = Depends(get_db)) -> list[Skill]:
    result = await db.execute(select(Skill).order_by(Skill.order, Skill.name))
    return list(result.scalars().all())


@router.post("/skills", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
async def admin_create_skill(body: SkillCreate, db: AsyncSession = Depends(get_db)) -> Skill:
    skill = Skill(**body.model_dump())
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


@router.patch("/skills/{skill_id}", response_model=SkillOut)
async def admin_update_skill(skill_id: int, body: SkillUpdate, db: AsyncSession = Depends(get_db)) -> Skill:
    skill = await _get_or_404(db, Skill, skill_id)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(skill, key, value)
    await db.commit()
    await db.refresh(skill)
    return skill


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_skill(skill_id: int, db: AsyncSession = Depends(get_db)) -> None:
    skill = await _get_or_404(db, Skill, skill_id)
    await db.delete(skill)
    await db.commit()


# ---------- experiences ----------


@router.get("/experiences", response_model=list[ExperienceOut])
async def admin_list_experiences(db: AsyncSession = Depends(get_db)) -> list[Experience]:
    result = await db.execute(select(Experience).order_by(Experience.order))
    return list(result.scalars().all())


@router.post("/experiences", response_model=ExperienceOut, status_code=status.HTTP_201_CREATED)
async def admin_create_experience(
    body: ExperienceCreate, db: AsyncSession = Depends(get_db)
) -> Experience:
    experience = Experience(**body.model_dump())
    db.add(experience)
    await db.commit()
    await db.refresh(experience)
    return experience


@router.patch("/experiences/{experience_id}", response_model=ExperienceOut)
async def admin_update_experience(
    experience_id: int, body: ExperienceUpdate, db: AsyncSession = Depends(get_db)
) -> Experience:
    experience = await _get_or_404(db, Experience, experience_id)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(experience, key, value)
    await db.commit()
    await db.refresh(experience)
    return experience


@router.delete("/experiences/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_experience(experience_id: int, db: AsyncSession = Depends(get_db)) -> None:
    experience = await _get_or_404(db, Experience, experience_id)
    await db.delete(experience)
    await db.commit()


# ---------- messages ----------


@router.get("/messages", response_model=list[MessageOut])
async def admin_list_messages(unread: bool | None = None, db: AsyncSession = Depends(get_db)) -> list[Message]:
    query = select(Message).order_by(Message.created_at.desc())
    if unread is not None:
        query = query.where(Message.is_read.is_(unread))
    result = await db.execute(query)
    return list(result.scalars().all())


@router.patch("/messages/{message_id}", response_model=MessageOut)
async def admin_update_message(
    message_id: int, body: MessagePatch, db: AsyncSession = Depends(get_db)
) -> Message:
    message = await _get_or_404(db, Message, message_id)
    message.is_read = body.is_read
    await db.commit()
    await db.refresh(message)
    return message


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_message(message_id: int, db: AsyncSession = Depends(get_db)) -> None:
    message = await _get_or_404(db, Message, message_id)
    await db.delete(message)
    await db.commit()


# ---------- testimonials ----------


@router.get("/testimonials", response_model=list[TestimonialOut])
async def admin_list_testimonials(
    status_filter: str | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> list[Testimonial]:
    query = select(Testimonial).order_by(Testimonial.created_at.desc())
    if status_filter:
        query = query.where(Testimonial.status == status_filter)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.patch("/testimonials/{testimonial_id}", response_model=TestimonialOut)
async def admin_update_testimonial(
    testimonial_id: int, body: TestimonialPatch, db: AsyncSession = Depends(get_db)
) -> Testimonial:
    testimonial = await _get_or_404(db, Testimonial, testimonial_id)
    testimonial.status = body.status
    await db.commit()
    await db.refresh(testimonial)
    return testimonial


@router.delete("/testimonials/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_testimonial(testimonial_id: int, db: AsyncSession = Depends(get_db)) -> None:
    testimonial = await _get_or_404(db, Testimonial, testimonial_id)
    await db.delete(testimonial)
    await db.commit()


# ---------- account ----------


@router.put("/password", response_model=UserOut)
async def change_password(
    current_password: str,
    new_password: str,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> User:
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    if not verify_password(user.password_hash, current_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(new_password)
    await db.commit()
    await db.refresh(user)
    return user
