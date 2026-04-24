"""
IronID — Load Tests (Locust)

Run:
  pip install locust
  locust -f load-tests/locustfile.py --host http://localhost:8000

Web UI: http://localhost:8089

Env vars:
  TEST_API_KEY   — authenticated API key (iid_test_...)
  TEST_HASH      — a known SHA-256 hash in the ledger for verify tests
"""

import io
import json
import os

from locust import HttpUser, TaskSet, between, task

API_KEY   = os.environ.get("TEST_API_KEY", "iid_test_REPLACE_ME")
TEST_HASH = os.environ.get("TEST_HASH", "a" * 64)

# Minimal 1×1 JPEG for upload tasks
TINY_JPEG = (
    b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
    b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
    b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xf5\x0a\x28\xa2\x80"
    b"\xff\xd9"
)


# ---- Public (unauthenticated) user ----

class PublicTasks(TaskSet):
    @task(5)
    def health(self):
        self.client.get("/health", name="GET /health")

    @task(10)
    def verify_by_hash(self):
        self.client.get(
            f"/v1/verify/{TEST_HASH}",
            name="GET /v1/verify/{hash}",
        )

    @task(4)
    def verify_by_upload(self):
        self.client.post(
            "/v1/verify",
            files={"file": ("test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")},
            name="POST /v1/verify",
        )


class PublicUser(HttpUser):
    tasks = [PublicTasks]
    wait_time = between(0.5, 2)
    weight = 3


# ---- Authenticated API user ----

class AuthTasks(TaskSet):
    def on_start(self):
        self.headers = {"Authorization": f"Bearer {API_KEY}"}

    @task(6)
    def list_certifications(self):
        self.client.get(
            "/v1/certifications?page=1&page_size=20",
            headers=self.headers,
            name="GET /v1/certifications",
        )

    @task(3)
    def list_keys(self):
        self.client.get("/v1/keys", headers=self.headers, name="GET /v1/keys")

    @task(1)
    def certify_file(self):
        """Low-weight — certify is async + writes to DB/R2."""
        self.client.post(
            "/v1/certify",
            headers=self.headers,
            files={"file": ("load_test.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")},
            data={"metadata": json.dumps({"source": "locust"})},
            name="POST /v1/certify",
        )


class AuthUser(HttpUser):
    tasks = [AuthTasks]
    wait_time = between(1, 3)
    weight = 1
