from collections.abc import AsyncIterator

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


# Tests run across multiple event loops (TestClient portal vs asyncio.run helpers),
# so a shared pool would hand out connections bound to a dead loop. NullPool avoids that.
_poolclass = pool.NullPool if "portfolio_test" in settings.DATABASE_URL else None

engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True, poolclass=_poolclass)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
