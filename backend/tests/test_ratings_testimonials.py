import io

PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"fake-payload" * 20


def _login(client) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.dev", "password": "S3curePass!"},
    )
    assert res.status_code == 200, res.text
    return res.json()


def _auth(client) -> dict:
    token = _login(client)
    return {"Authorization": f"Bearer {token['access_token']}"}


def _create_project(client, headers, slug="vote-target"):
    res = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={"slug": slug, "title": "Vote Target", "summary": "used for voting tests"},
    )
    assert res.status_code == 201, res.text
    return res.json()


def test_project_rating_validation(client):
    headers = _auth(client)
    bad = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={"slug": "bad-rating", "title": "Bad", "rating": 7},
    )
    assert bad.status_code == 422

    ok = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={"slug": "good-rating", "title": "Good", "rating": 4},
    )
    assert ok.status_code == 201
    assert ok.json()["rating"] == 4
    client.delete(f"/api/v1/admin/projects/{ok.json()['id']}", headers=headers)


def test_vote_flow_and_dedupe(client):
    headers = _auth(client)
    project = _create_project(client, headers, slug="vote-flow")
    pid = project["id"]

    first = client.post(
        f"/api/v1/projects/{pid}/vote",
        json={"value": 5, "visitor_id": "visitor-aaaa-1111"},
    )
    assert first.status_code == 201, first.text
    assert first.json() == {"rating_avg": 5.0, "rating_count": 1, "my_vote": 5}

    # same visitor changes their vote instead of adding a second row
    second = client.post(
        f"/api/v1/projects/{pid}/vote",
        json={"value": 3, "visitor_id": "visitor-aaaa-1111"},
    )
    assert second.status_code == 201
    assert second.json() == {"rating_avg": 3.0, "rating_count": 1, "my_vote": 3}

    third = client.post(
        f"/api/v1/projects/{pid}/vote",
        json={"value": 4, "visitor_id": "visitor-bbbb-2222"},
    )
    assert third.json()["rating_avg"] == 3.5
    assert third.json()["rating_count"] == 2

    listed = client.get("/api/v1/projects")
    match = next(p for p in listed.json() if p["id"] == pid)
    assert match["rating_count"] == 2
    assert match["rating_avg"] == 3.5

    client.delete(f"/api/v1/admin/projects/{pid}", headers=headers)


def test_vote_validation_and_404(client):
    headers = _auth(client)
    project = _create_project(client, headers, slug="vote-validation")
    pid = project["id"]

    assert (
        client.post(f"/api/v1/projects/{pid}/vote", json={"value": 0, "visitor_id": "visitor-1234"}).status_code
        == 422
    )
    assert (
        client.post(f"/api/v1/projects/{pid}/vote", json={"value": 6, "visitor_id": "visitor-1234"}).status_code
        == 422
    )
    assert (
        client.post(f"/api/v1/projects/{pid}/vote", json={"value": 5, "visitor_id": "x"}).status_code
        == 422
    )
    assert (
        client.post("/api/v1/projects/999999/vote", json={"value": 5, "visitor_id": "visitor-1234"}).status_code
        == 404
    )

    client.delete(f"/api/v1/admin/projects/{pid}", headers=headers)


def test_testimonial_submit_with_avatar_and_moderation(client):
    res = client.post(
        "/api/v1/testimonials",
        data={"name": "Visitor One", "role": "CTO", "quote": "Absolutely brilliant work on our API.", "rating": "5"},
        files={"avatar": ("face.png", io.BytesIO(PNG_BYTES), "image/png")},
    )
    assert res.status_code == 201, res.text
    created = res.json()
    assert created["rating"] == 5
    assert created["avatar_url"].startswith("/api/uploads/")
    assert created["status"] == "published"
    tid = created["id"]

    public = client.get("/api/v1/testimonials")
    assert public.status_code == 200
    assert any(t["id"] == tid for t in public.json())

    headers = _auth(client)
    hidden = client.patch(
        f"/api/v1/admin/testimonials/{tid}",
        headers=headers,
        json={"status": "pending"},
    )
    assert hidden.status_code == 200
    assert hidden.json()["status"] == "pending"
    assert not any(t["id"] == tid for t in client.get("/api/v1/testimonials").json())

    assert client.delete(f"/api/v1/admin/testimonials/{tid}", headers=headers).status_code == 204


def test_testimonial_requires_auth_for_admin(client):
    assert client.get("/api/v1/admin/testimonials").status_code == 401


def test_testimonial_validation(client):
    too_short = client.post(
        "/api/v1/testimonials",
        data={"name": "A", "quote": "short", "rating": "3"},
    )
    assert too_short.status_code == 422

    bad_rating = client.post(
        "/api/v1/testimonials",
        data={"name": "Valid Name", "quote": "This quote is long enough.", "rating": "9"},
    )
    assert bad_rating.status_code == 422

    bad_avatar = client.post(
        "/api/v1/testimonials",
        data={"name": "Valid Name", "quote": "This quote is long enough.", "rating": "4"},
        files={"avatar": ("evil.exe", io.BytesIO(b"MZ"), "application/octet-stream")},
    )
    assert bad_avatar.status_code == 415
