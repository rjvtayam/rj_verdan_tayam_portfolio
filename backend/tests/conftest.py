import asyncio
import os

os.environ["DATABASE_URL"] = "postgresql+asyncpg://portfolio:portfolio_dev@localhost:5432/portfolio_test"
os.environ.setdefault("SECRET_KEY", "test-secret-key")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def database():
    async def setup() -> None:
        from app import models  # noqa: F401
        from app.core.security import hash_password
        from app.db import Base, SessionLocal, engine
        from app.models import User

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        async with SessionLocal() as session:
            session.add(
                User(email="admin@test.dev", password_hash=hash_password("S3curePass!"), role="admin")
            )
            await session.commit()

    asyncio.run(setup())
    yield


@pytest.fixture(autouse=True)
def reset_rate_limits():
    from app.core import ratelimit

    ratelimit._hits.clear()
    yield
    ratelimit._hits.clear()


@pytest.fixture()
def client(database):
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
