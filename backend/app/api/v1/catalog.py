from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Experience, Skill
from app.schemas import ExperienceOut, SkillOut

router = APIRouter()


@router.get("/skills", response_model=list[SkillOut])
async def list_skills(db: AsyncSession = Depends(get_db)) -> list[Skill]:
    result = await db.execute(select(Skill).order_by(Skill.order, Skill.name))
    return list(result.scalars().all())


@router.get("/experiences", response_model=list[ExperienceOut])
async def list_experiences(db: AsyncSession = Depends(get_db)) -> list[Experience]:
    result = await db.execute(select(Experience).order_by(Experience.order, Experience.start_date.desc()))
    return list(result.scalars().all())
