"""Health check — sanity test that the API is running."""

import httpx


def test_health(client: httpx.Client):
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "version" in body
    assert "env" in body
