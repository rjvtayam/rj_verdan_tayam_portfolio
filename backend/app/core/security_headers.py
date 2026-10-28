"""Security response headers for every backend response.

Set once here rather than per-route so no surface can ship without them.
The CSP is compatible with the SPA it fronts: a single inline boot script
(hashed, not 'unsafe-inline'), self-hosted fonts, and same-origin API calls.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# sha256 of the inline theme/boot <script> in frontend/index.html — keep in
# sync if that script's bytes ever change (see scripts/csp hash note).
_BOOT_SCRIPT_HASH = "sha256-RKogb+JasKiWXX3MLOs6LHme7GdIZBZF/9BA1GDyJl0="

# report-only until the policy is proven in production, then flip enforce on.
CSP_REPORT_ONLY = (
    "default-src 'self'; "
    f"script-src 'self' {_BOOT_SCRIPT_HASH}; "
    # Tailwind + framer-motion write inline styles at runtime.
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: blob:; "
    "font-src 'self'; "
    "connect-src 'self'; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "frame-ancestors 'none'"
)

PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", PERMISSIONS_POLICY)
        response.headers.setdefault("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY)
        return response
