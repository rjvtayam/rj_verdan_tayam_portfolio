import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_AVATAR_BYTES = 2 * 1024 * 1024  # 2 MB


def ensure_upload_dir() -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


async def save_avatar(file: UploadFile) -> str:
    """Validate and persist an avatar image; returns its public URL path."""
    ensure_upload_dir()

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Avatar must be a PNG, JPG, WEBP or GIF image",
        )

    content = await file.read()
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=413, detail="Avatar must be 2 MB or smaller")
    if not content:
        raise HTTPException(status_code=422, detail="Empty avatar file")

    name = f"{uuid.uuid4().hex}{suffix}"
    (UPLOAD_DIR / name).write_bytes(content)
    return f"/api/uploads/{name}"
