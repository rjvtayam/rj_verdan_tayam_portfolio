"""Security response headers and structured error handling."""


def test_security_headers_present(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    h = res.headers
    assert h["X-Content-Type-Options"] == "nosniff"
    assert h["X-Frame-Options"] == "DENY"
    assert h["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert "camera=()" in h["Permissions-Policy"]
    # report-only until the policy is proven, then flipped to enforce
    csp = h["Content-Security-Policy-Report-Only"]
    assert "default-src 'self'" in csp
    assert "frame-ancestors 'none'" in csp
    assert "sha256-" in csp  # inline boot script is hashed, not 'unsafe-inline'


def test_request_id_header_present(client):
    res = client.get("/api/health")
    assert res.headers.get("X-Request-ID")


def test_cache_control_on_public_vs_private(client):
    public = client.get("/api/v1/projects")
    assert public.headers["Cache-Control"] == "public, max-age=300"

    private = client.get("/api/v1/admin/stats")
    assert private.headers["Cache-Control"] == "no-store"


def test_unauthenticated_admin_is_clean_json_401(client):
    res = client.get("/api/v1/admin/stats")
    assert res.status_code == 401
    assert res.json()["detail"]
