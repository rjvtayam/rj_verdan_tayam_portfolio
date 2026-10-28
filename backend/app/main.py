from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api.v1 import api_router
from app.core.config import settings
from app.core.uploads import UPLOAD_DIR, ensure_upload_dir

app = FastAPI(title=settings.APP_NAME, version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")


class UploadSafeGZipMiddleware(GZipMiddleware):
    """Skip compression for uploads — jpg/webp/pdf are already compressed,
    so gzipping them only burns CPU for ~0 bytes saved."""

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] == "http" and scope.get("path", "").startswith("/api/uploads"):
            await self.app(scope, receive, send)
            return
        await super().__call__(scope, receive, send)


class CacheControlMiddleware(BaseHTTPMiddleware):
    """Cache hints per surface:
    - uploads: uuid-named files are immutable → cache for a year;
    - public catalog GETs: safe to reuse for 5 minutes;
    - everything else (auth, admin, writes): never cache.
    """

    IMMUTABLE = "public, max-age=31536000, immutable"
    PUBLIC_SHORT = "public, max-age=300"
    NO_STORE = "no-store"

    # Prefixes that must never be cached by proxies or the browser.
    _PRIVATE_PREFIXES = ("/api/v1/admin", "/api/v1/auth", "/api/docs", "/api/openapi.json")

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        path = request.url.path
        if path.startswith("/api/uploads"):
            response.headers["Cache-Control"] = self.IMMUTABLE
        elif path.startswith(self._PRIVATE_PREFIXES) or request.method != "GET":
            response.headers["Cache-Control"] = self.NO_STORE
        elif path.startswith("/api/"):
            response.headers["Cache-Control"] = self.PUBLIC_SHORT
        return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Registered after CORS so compression wraps the API, not the CORS handshake.
app.add_middleware(UploadSafeGZipMiddleware, minimum_size=1024)
app.add_middleware(CacheControlMiddleware)

ensure_upload_dir()
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(api_router, prefix="/api/v1")


@app.get("/api/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "service": settings.APP_NAME}
