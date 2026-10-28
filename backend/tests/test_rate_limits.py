from app.core.config import settings


def _message(i: int) -> dict:
    return {
        "name": f"Visitor {i}",
        "email": f"visitor{i}@example.com",
        "subject": "Rate limit",
        "body": f"Message body number {i} sent by the rate limit test.",
    }


def test_messages_rate_limited_per_hour(client):
    limit = settings.RATE_LIMIT_MESSAGES_PER_HOUR
    for i in range(limit):
        assert client.post("/api/v1/messages", json=_message(i)).status_code == 201

    blocked = client.post("/api/v1/messages", json=_message(limit))
    assert blocked.status_code == 429
    assert "too many" in blocked.json()["detail"].lower()


def test_testimonials_rate_limited_per_hour(client):
    limit = settings.RATE_LIMIT_MESSAGES_PER_HOUR
    for i in range(limit):
        res = client.post(
            "/api/v1/testimonials",
            data={
                "name": f"Visitor {i}",
                "quote": f"Great work on project number {i}, truly well done.",
                "rating": "5",
            },
        )
        assert res.status_code == 201, res.text

    blocked = client.post(
        "/api/v1/testimonials",
        data={"name": "Sixth", "quote": "This one should be blocked by the limiter.", "rating": "5"},
    )
    assert blocked.status_code == 429
