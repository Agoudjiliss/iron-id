"""
Integration tests — Certification endpoints (requires API key).
"""

import io
import time

import httpx
import pytest


class TestCertifyAuth:
    def test_certify_without_key_returns_401(self, client: httpx.Client, small_jpeg: bytes):
        res = client.post(
            "/v1/certify",
            files={"file": ("test.jpg", io.BytesIO(small_jpeg), "image/jpeg")},
            data={"metadata": "{}"},
        )
        assert res.status_code == 401

    def test_certify_with_invalid_key_returns_401(self, client: httpx.Client, small_jpeg: bytes):
        res = client.post(
            "/v1/certify",
            headers={"Authorization": "Bearer iid_live_INVALID"},
            files={"file": ("test.jpg", io.BytesIO(small_jpeg), "image/jpeg")},
            data={"metadata": "{}"},
        )
        assert res.status_code == 401


class TestCertifyFlow:
    def test_certify_returns_202_with_pending_status(
        self, client: httpx.Client, api_key: str, small_jpeg: bytes
    ):
        res = client.post(
            "/v1/certify",
            headers={"Authorization": f"Bearer {api_key}"},
            files={"file": ("test.jpg", io.BytesIO(small_jpeg), "image/jpeg")},
            data={"metadata": '{"test":"true"}'},
        )
        assert res.status_code == 202
        body = res.json()
        assert "id" in body
        assert body["status"] in ("pending", "processing")

    def test_get_certification_by_id(
        self, client: httpx.Client, api_key: str, small_jpeg: bytes
    ):
        # Create
        create_res = client.post(
            "/v1/certify",
            headers={"Authorization": f"Bearer {api_key}"},
            files={"file": ("test.jpg", io.BytesIO(small_jpeg), "image/jpeg")},
            data={"metadata": "{}"},
        )
        assert create_res.status_code == 202
        cert_id = create_res.json()["id"]

        # Get
        get_res = client.get(
            f"/v1/certify/{cert_id}",
            headers={"Authorization": f"Bearer {api_key}"},
        )
        assert get_res.status_code == 200
        body = get_res.json()
        assert body["id"] == cert_id
        assert body["status"] in ("pending", "processing", "certified", "failed")

    def test_list_certifications(self, client: httpx.Client, api_key: str):
        res = client.get(
            "/v1/certifications",
            headers={"Authorization": f"Bearer {api_key}"},
        )
        assert res.status_code == 200
        body = res.json()
        assert "data" in body
        assert "total" in body
        assert "page" in body

    def test_certify_unsupported_mime_returns_415(
        self, client: httpx.Client, api_key: str
    ):
        fake_exe = b"MZ" + b"\x00" * 100  # PE header magic
        res = client.post(
            "/v1/certify",
            headers={"Authorization": f"Bearer {api_key}"},
            files={"file": ("malware.exe", io.BytesIO(fake_exe), "application/octet-stream")},
            data={"metadata": "{}"},
        )
        assert res.status_code == 415
