"""
Integration tests — API key management endpoints.
"""

import httpx
import pytest


class TestKeysAuth:
    def test_list_keys_without_auth_returns_401(self, client: httpx.Client):
        res = client.get("/v1/keys")
        assert res.status_code == 401


class TestKeysFlow:
    def test_create_key_returns_raw_key(self, client: httpx.Client, api_key: str):
        res = client.post(
            "/v1/keys",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"name": "Test key e2e", "environment": "test"},
        )
        assert res.status_code == 201
        body = res.json()
        assert "raw_key" in body
        assert body["raw_key"].startswith("iid_test_")
        assert body["name"] == "Test key e2e"
        return body["id"]

    def test_list_keys_includes_created_key(self, client: httpx.Client, api_key: str):
        # Create
        create_res = client.post(
            "/v1/keys",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"name": "Test list key", "environment": "test"},
        )
        assert create_res.status_code == 201
        new_id = create_res.json()["id"]

        # List
        list_res = client.get("/v1/keys", headers={"Authorization": f"Bearer {api_key}"})
        assert list_res.status_code == 200
        ids = [k["id"] for k in list_res.json()]
        assert new_id in ids

    def test_revoke_key(self, client: httpx.Client, api_key: str):
        # Create
        create_res = client.post(
            "/v1/keys",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"name": "To be revoked", "environment": "test"},
        )
        assert create_res.status_code == 201
        key_id = create_res.json()["id"]

        # Revoke
        del_res = client.delete(
            f"/v1/keys/{key_id}",
            headers={"Authorization": f"Bearer {api_key}"},
        )
        assert del_res.status_code == 204

    def test_revoke_nonexistent_key_returns_404(self, client: httpx.Client, api_key: str):
        import uuid
        fake_id = str(uuid.uuid4())
        res = client.delete(
            f"/v1/keys/{fake_id}",
            headers={"Authorization": f"Bearer {api_key}"},
        )
        assert res.status_code == 404
