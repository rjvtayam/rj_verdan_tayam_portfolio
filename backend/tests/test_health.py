def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_projects_empty_initially(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    assert response.json() == []


def test_unknown_project_404(client):
    assert client.get("/api/v1/projects/nope").status_code == 404


def test_admin_requires_auth(client):
    assert client.get("/api/v1/admin/stats").status_code == 401
    assert client.get("/api/v1/admin/projects").status_code == 401
    assert client.get("/api/v1/auth/me").status_code == 401
