from app.core.security import create_refresh_token, decode_token


def _login(client) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.dev", "password": "S3curePass!"},
    )
    assert res.status_code == 200, res.text
    return res.json()


def _user_id(client, access_token: str) -> str:
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me.status_code == 200, me.text
    return str(me.json()["id"])


def test_refresh_returns_working_access_token(client):
    token = _login(client)
    user_id = _user_id(client, token["access_token"])
    refresh = create_refresh_token(user_id, "admin")

    res = client.post("/api/v1/auth/refresh", params={"credentials": refresh})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["role"] == "admin"
    assert body["access_token"]

    # the minted token is a fresh ACCESS token for the same user
    # (claims-based check: login + refresh within one wall-clock second would
    # make a string-comparison flaky, since iat has second granularity)
    claims = decode_token(body["access_token"])
    assert claims is not None
    assert claims["type"] == "access"
    assert claims["sub"] == user_id
    assert claims["role"] == "admin"

    # and it actually authenticates
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "admin@test.dev"


def test_login_issues_working_refresh_token(client):
    """Login must hand back a refresh token that mints a usable access token."""
    token = _login(client)
    assert token["refresh_token"]

    res = client.post("/api/v1/auth/refresh", params={"credentials": token["refresh_token"]})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["access_token"]
    assert body["refresh_token"]

    # the rotated refresh token works too (rotation, not a fixed token)
    res2 = client.post("/api/v1/auth/refresh", params={"credentials": body["refresh_token"]})
    assert res2.status_code == 200

    # and the minted access token authenticates
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == "admin@test.dev"


def test_refresh_rejects_wrong_token_type(client):
    token = _login(client)
    # an access token must not be accepted where a refresh token is required
    res = client.post("/api/v1/auth/refresh", params={"credentials": token["access_token"]})
    assert res.status_code == 401


def test_refresh_rejects_garbage_credentials(client):
    assert (
        client.post("/api/v1/auth/refresh", params={"credentials": "not-a-jwt"}).status_code == 401
    )
    # missing credentials fails request validation before reaching the handler
    assert client.post("/api/v1/auth/refresh").status_code == 422


def test_refresh_rejects_unknown_user(client):
    refresh = create_refresh_token("999999999", "admin")
    assert client.post("/api/v1/auth/refresh", params={"credentials": refresh}).status_code == 401
