"""Structured request logging and a global safety net.

Every request emits one line: request id, method, path, status, latency.
Bodies are never logged (they can carry passwords and PII). Uncaught
exceptions become a clean JSON 500 with the request id so a user-reported
id can be matched to a log line.
"""
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

log = logging.getLogger("portfolio.request")

# Paths too noisy or sensitive to log individually.
_SKIP_LOG = {"/api/health"}


def configure_logging() -> None:
    """Give the request logger a handler of its own.

    uvicorn's default config leaves the root logger at WARNING, which would
    silently drop these INFO lines; production hosts (gunicorn, systemd)
    configure root differently again, so this logger is made self-sufficient.
    """
    if log.handlers:
        return
    handler = logging.StreamHandler()
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)-7s %(name)s %(message)s", "%H:%M:%S")
    )
    log.setLevel(logging.INFO)
    log.addHandler(handler)
    log.propagate = False


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach a request id and log one structured line per request."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = uuid.uuid4().hex[:12]
        request.state.request_id = request_id
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            latency = (time.perf_counter() - start) * 1000
            log.exception(
                "request_failed rid=%s method=%s path=%s latency_ms=%.1f",
                request_id,
                request.method,
                request.url.path,
                latency,
            )
            raise
        latency = (time.perf_counter() - start) * 1000
        response.headers["X-Request-ID"] = request_id
        if request.url.path not in _SKIP_LOG:
            log.info(
                "request rid=%s method=%s path=%s status=%s latency_ms=%.1f",
                request_id,
                request.method,
                request.url.path,
                response.status_code,
                latency,
            )
        return response


def register_exception_handlers(app) -> None:
    """Return clean JSON for unhandled errors instead of a stack-trace page."""

    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        log.exception("unhandled rid=%s path=%s", request_id, request.url.path)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "request_id": request_id},
        )

    app.add_exception_handler(Exception, unhandled_exception_handler)
