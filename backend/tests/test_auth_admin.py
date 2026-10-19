def _login(client, email="admin@test.dev", password="S3curePass!"):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()


def test_login_and_me(client):
    token = _login(client)
    assert token["role"] == "admin"
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "admin@test.dev"


def test_login_wrong_password(client):
    response = client.post(
        "/api/v1/auth/login", json={"email": "admin@test.dev", "password": "wrong"}
    )
    assert response.status_code == 401


def test_project_crud(client):
    token = _login(client)
    headers = {"Authorization": f"Bearer {token['access_token']}"}

    created = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "test-project",
            "title": "Test Project",
            "summary": "A project used in tests",
            "tech_stack": ["React", "FastAPI"],
            "tags": ["testing", "react"],
            "featured": True,
        },
    )
    assert created.status_code == 201, created.text
    project_id = created.json()["id"]
    assert {t["name"] for t in created.json()["tags"]} == {"testing", "react"}

    duplicate = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={"slug": "test-project", "title": "Duplicate"},
    )
    assert duplicate.status_code == 409

    updated = client.patch(
        f"/api/v1/admin/projects/{project_id}",
        headers=headers,
        json={"title": "Test Project v2", "tags": ["testing"]},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Test Project v2"

    public = client.get("/api/v1/projects")
    assert public.status_code == 200
    assert any(p["slug"] == "test-project" for p in public.json())

    deleted = client.delete(f"/api/v1/admin/projects/{project_id}", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/api/v1/projects/test-project").status_code == 404


def test_message_create_and_validation(client):
    ok = client.post(
        "/api/v1/messages",
        json={
            "name": "Jane",
            "email": "jane@example.com",
            "subject": "Hi",
            "body": "Hello, great portfolio!",
        },
    )
    assert ok.status_code == 201

    bad = client.post(
        "/api/v1/messages", json={"name": "J", "email": "not-an-email", "body": "short"}
    )
    assert bad.status_code == 422


def test_admin_sees_messages(client):
    client.post(
        "/api/v1/messages",
        json={
            "name": "Jane",
            "email": "jane@example.com",
            "subject": "Project",
            "body": "Loved your work!",
        },
    )
    token = _login(client)
    headers = {"Authorization": f"Bearer {token['access_token']}"}
    messages = client.get("/api/v1/admin/messages", headers=headers)
    assert messages.status_code == 200
    assert len(messages.json()) >= 1
    stats = client.get("/api/v1/admin/stats", headers=headers)
    assert stats.status_code == 200
    assert stats.json()["messages"] >= 1
