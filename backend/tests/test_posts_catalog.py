from app.schemas import reading_minutes


def _auth(client) -> dict:
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.dev", "password": "S3curePass!"},
    )
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def _create_post(client, headers, slug: str, **fields) -> dict:
    payload = {"slug": slug, "title": slug.replace("-", " ").title(), "content_md": "# note"}
    payload.update(fields)
    res = client.post("/api/v1/admin/posts", headers=headers, json=payload)
    assert res.status_code == 201, res.text
    return res.json()


def _delete_post(client, headers, post_id: int) -> None:
    assert client.delete(f"/api/v1/admin/posts/{post_id}", headers=headers).status_code == 204


def test_posts_list_includes_only_published(client):
    headers = _auth(client)
    published = _create_post(client, headers, "catalog-published", project_slug="proj-a")
    draft = _create_post(client, headers, "catalog-draft", status="draft")

    res = client.get("/api/v1/posts")
    assert res.status_code == 200
    slugs = [p["slug"] for p in res.json()]
    assert "catalog-published" in slugs
    assert "catalog-draft" not in slugs

    _delete_post(client, headers, published["id"])
    _delete_post(client, headers, draft["id"])


def test_posts_list_is_slim_with_precomputed_reading_time(client):
    """List payloads must not carry content_md; reading_minutes stands in."""
    headers = _auth(client)
    # 400 prose words → 2 minutes at 200 wpm (matches frontend lib/format.ts)
    body = "# note\n\n" + " ".join(f"word{i}" for i in range(400))
    post = _create_post(client, headers, "slim-payload", content_md=body)

    res = client.get("/api/v1/posts")
    entry = next(p for p in res.json() if p["slug"] == "slim-payload")
    assert "content_md" not in entry
    assert entry["reading_minutes"] == 2

    # detail keeps the full body
    detail = client.get("/api/v1/posts/slim-payload").json()
    assert detail["content_md"] == body

    _delete_post(client, headers, post["id"])


def test_posts_filters_by_project_and_level(client):
    headers = _auth(client)
    a = _create_post(client, headers, "filter-project", project_slug="proj-a", level="beginner")
    b = _create_post(client, headers, "filter-level", project_slug="proj-b", level="advanced")

    by_project = client.get("/api/v1/posts", params={"project": "proj-a"})
    assert by_project.status_code == 200
    assert {p["slug"] for p in by_project.json()} == {"filter-project"}

    by_level = client.get("/api/v1/posts", params={"level": "advanced"})
    assert {p["slug"] for p in by_level.json()} == {"filter-level"}

    combined = client.get("/api/v1/posts", params={"project": "proj-b", "level": "beginner"})
    assert combined.json() == []

    _delete_post(client, headers, a["id"])
    _delete_post(client, headers, b["id"])


def test_posts_detail_and_draft_404(client):
    headers = _auth(client)
    published = _create_post(client, headers, "detail-published", content_md="# full body")
    draft = _create_post(client, headers, "detail-draft", status="draft")

    res = client.get("/api/v1/posts/detail-published")
    assert res.status_code == 200
    assert res.json()["content_md"] == "# full body"

    # drafts and unknown slugs are indistinguishable from the public side
    assert client.get("/api/v1/posts/detail-draft").status_code == 404
    assert client.get("/api/v1/posts/never-existed").status_code == 404

    _delete_post(client, headers, published["id"])
    _delete_post(client, headers, draft["id"])


def test_skills_catalog_endpoint(client):
    headers = _auth(client)
    bad = client.post(
        "/api/v1/admin/skills",
        headers=headers,
        json={"name": "Invalid", "category": "Languages", "proficiency": 9},
    )
    assert bad.status_code == 422

    created = client.post(
        "/api/v1/admin/skills",
        headers=headers,
        json={"name": "Rust", "category": "Languages", "proficiency": 4, "order": 99},
    )
    assert created.status_code == 201, created.text

    res = client.get("/api/v1/skills")
    assert res.status_code == 200
    match = next(s for s in res.json() if s["name"] == "Rust")
    assert match["category"] == "Languages"
    assert match["proficiency"] == 4

    assert client.delete(f"/api/v1/admin/skills/{created.json()['id']}", headers=headers).status_code == 204


def test_experiences_catalog_endpoint(client):
    headers = _auth(client)
    created = client.post(
        "/api/v1/admin/experiences",
        headers=headers,
        json={
            "company": "Acme Corp",
            "role": "Engineer",
            "start_date": "2024-01-15",
            "bullets": ["Shipped things"],
            "order": 50,
        },
    )
    assert created.status_code == 201, created.text

    res = client.get("/api/v1/experiences")
    assert res.status_code == 200
    match = next(e for e in res.json() if e["company"] == "Acme Corp")
    assert match["role"] == "Engineer"
    assert match["start_date"] == "2024-01-15"
    assert match["end_date"] is None
    assert match["bullets"] == ["Shipped things"]

    exp_id = created.json()["id"]
    assert client.delete(f"/api/v1/admin/experiences/{exp_id}", headers=headers).status_code == 204


def test_reading_minutes_matches_frontend_algorithm():
    """Parity with frontend lib/format.ts readingTime(): 200 wpm prose,
    fenced code at 50 lines/min, floored at 1 minute."""
    assert reading_minutes("") == 1
    assert reading_minutes("short note") == 1
    assert reading_minutes(" ".join(f"w{i}" for i in range(200))) == 1
    assert reading_minutes(" ".join(f"w{i}" for i in range(400))) == 2

    code = "```python\n" + "\n".join(f"print({i})" for i in range(50)) + "\n```"
    assert reading_minutes(code) == 1
    long_code = "```python\n" + "\n".join(f"print({i})" for i in range(150)) + "\n```"
    assert reading_minutes(long_code) == 3
