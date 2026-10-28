from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.ratelimit import rate_limit
from app.db import get_db
from app.models import Message
from app.schemas import MessageCreate

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_message(
    body: MessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    rate_limit(request, "messages", settings.RATE_LIMIT_MESSAGES_PER_HOUR)
    message = Message(**body.model_dump())
    db.add(message)
    await db.commit()
    return {"status": "sent"}
