from app.core.config import settings


def _auth(client) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.dev", "password": "S3curePass!"},
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _create_project(client, headers, slug: str = "vote-rl-target") -> dict:
    res = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={"slug": slug, "title": "Vote RL Target", "summary": "rate limit target"},
    )
    assert res.status_code == 201, res.text
    return res.json()


def test_vote_rate_limited_per_hour(client):
    headers = _auth(client)
    project = _create_project(client, headers)
    limit = settings.RATE_LIMIT_VOTES_PER_HOUR

    for i in range(limit):
        res = client.post(
            f"/api/v1/projects/{project['id']}/vote",
            json={"value": (i % 5) + 1, "visitor_id": f"rl-visitor-{i}"},
        )
        assert res.status_code == 201, res.text

    blocked = client.post(
        f"/api/v1/projects/{project['id']}/vote",
        json={"value": 5, "visitor_id": "rl-visitor-blocked"},
    )
    assert blocked.status_code == 429
    assert "too many" in blocked.json()["detail"].lower()

    assert client.delete(
        f"/api/v1/admin/projects/{project['id']}", headers=headers
    ).status_code == 204
