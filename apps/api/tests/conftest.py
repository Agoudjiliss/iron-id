"""
IronID API — pytest fixtures for integration tests.

Requirements:
  - Running Postgres (configured via TEST_DATABASE_URL env var)
  - Running Redis (TEST_REDIS_URL)
  - Set TEST_API_BASE_URL to override (default: http://localhost:8000)

Run with:
  pytest apps/api/tests/ -v
"""

import asyncio
import os
import uuid

import httpx
import pytest
import pytest_asyncio

API_BASE = os.environ.get("TEST_API_BASE_URL", "http://localhost:8000")


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def client() -> httpx.Client:
    """Synchronous HTTP client for the running API."""
    with httpx.Client(base_url=API_BASE, timeout=30) as c:
        yield c


@pytest.fixture(scope="session")
def api_key(client: httpx.Client) -> str:
    """
    Create a fresh API key via Clerk-authenticated session.

    In CI, pass a pre-generated key via env var TEST_API_KEY to avoid
    needing a live Clerk session.
    """
    from_env = os.environ.get("TEST_API_KEY")
    if from_env:
        return from_env

    pytest.skip(
        "TEST_API_KEY not set — skipping tests that require authentication. "
        "Set TEST_API_KEY=iid_test_... to run authenticated tests."
    )


@pytest.fixture
def small_jpeg() -> bytes:
    """Minimal valid JPEG bytes (1×1 white pixel)."""
    return (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
        b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
        b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\x1e"
        b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
        b"\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
        b"\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04"
        b"\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa"
        b"\x07\"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n"
        b"\x16\x17\x18\x19\x1a%&'()*456789:CDEFGHIJ"
        b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xf5\x0a\x28\xa2\x80"
        b"\xff\xd9"
    )
