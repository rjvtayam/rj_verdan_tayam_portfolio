import time
from collections import defaultdict

from fastapi import HTTPException, Request, status

_hits: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))


def rate_limit(request: Request, bucket: str, limit: int, window_seconds: int = 3600) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    cutoff = now - window_seconds
    hits = _hits[bucket][ip]
    hits[:] = [t for t in hits if t > cutoff]
    if len(hits) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests, please try again later",
        )
    hits.append(now)
