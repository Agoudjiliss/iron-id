"""
Integration tests — Rate limiting.
Verifies that the sliding window rate limiter returns 429 after burst.
"""

import httpx
import pytest


@pytest.mark.slow
def test_public_rate_limit(client: httpx.Client):
    """
    Public endpoints are limited to 30 req/min per IP.
    This test fires 35 requests and expects at least one 429.
    Mark as slow — skipped in fast CI with pytest -m 'not slow'.
    """
    fake_hash = "c" * 64
    responses = [client.get(f"/v1/verify/{fake_hash}") for _ in range(35)]
    status_codes = [r.status_code for r in responses]
    assert 429 in status_codes, (
        f"Expected at least one 429 after 35 requests, got: {set(status_codes)}"
    )
