from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Portfolio API"
    DATABASE_URL: str = "postgresql+asyncpg://portfolio:portfolio_dev@localhost:5432/portfolio"
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:4173"]
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "change-me"
    RATE_LIMIT_MESSAGES_PER_HOUR: int = 5


settings = Settings()
