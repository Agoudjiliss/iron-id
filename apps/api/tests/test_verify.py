"""
Integration tests — Verification endpoints (public, no auth required).
"""

import io
import hashlib

import httpx
import pytest


class TestVerifyByHash:
    def test_unknown_hash_returns_not_certified(self, client: httpx.Client):
        fake_hash = "a" * 64
        res = client.get(f"/v1/verify/{fake_hash}")
        assert res.status_code == 200
        body = res.json()
        assert body["is_certified"] is False
        assert body["file_hash_sha256"] == fake_hash

    def test_invalid_hash_format_returns_400(self, client: httpx.Client):
        res = client.get("/v1/verify/not-a-sha256")
        assert res.status_code == 400

    def test_hash_lookup_has_ledger_count(self, client: httpx.Client):
        fake_hash = "b" * 64
        res = client.get(f"/v1/verify/{fake_hash}")
        assert res.status_code == 200
        assert "ledger_history_count" in res.json()


class TestVerifyByUpload:
    def test_upload_unknown_file_returns_not_certified(
        self, client: httpx.Client, small_jpeg: bytes
    ):
        res = client.post(
            "/v1/verify",
            files={"file": ("test.jpg", io.BytesIO(small_jpeg), "image/jpeg")},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["is_certified"] is False
        # hash should match client-side SHA-256
        expected = hashlib.sha256(small_jpeg).hexdigest()
        assert body["file_hash_sha256"] == expected

    def test_missing_file_returns_422(self, client: httpx.Client):
        res = client.post("/v1/verify")
        assert res.status_code == 422
