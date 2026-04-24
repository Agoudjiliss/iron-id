"""
ironid — Official Python SDK for IronID.

Example usage::

    from ironid import IronID

    client = IronID(api_key="iid_live_...")

    # Certify a file (sync, blocks until done)
    cert = client.certifications.certify_and_wait(
        open("photo.jpg", "rb"),
        filename="photo.jpg",
        metadata={"author": "Jane Doe", "location": "Paris"},
    )
    print(cert.file_hash_sha256)   # a3f5b9c1...
    print(cert.certified_url)      # https://r2.ironid.io/...

    # Verify by hash
    result = client.verify.by_hash("a3f5b9c1...")
    print(result.is_certified)     # True

Use as a context manager to ensure the underlying HTTP connection is closed::

    with IronID(api_key="iid_live_...") as client:
        keys = client.keys.list()
"""

from __future__ import annotations

from ._http import HttpClient
from ._resources import Certifications, Keys, Verify
from .exceptions import IronIDAuthError, IronIDError, IronIDRateLimitError, IronIDTimeoutError
from .types import (
    APIKey,
    Certification,
    CertificationsPage,
    CreateAPIKeyResult,
    VerificationResult,
)

__all__ = [
    "IronID",
    "IronIDError",
    "IronIDAuthError",
    "IronIDRateLimitError",
    "IronIDTimeoutError",
    "Certification",
    "CertificationsPage",
    "VerificationResult",
    "APIKey",
    "CreateAPIKeyResult",
]

DEFAULT_BASE_URL = "https://api.ironid.io"
DEFAULT_TIMEOUT  = 30.0


class IronID:
    """
    IronID API client.

    Args:
        api_key:  Your IronID API key (iid_live_... or iid_test_...).
        base_url: Override the API base URL (useful for self-hosted or testing).
        timeout:  Request timeout in seconds (default: 30).
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        if not api_key:
            raise ValueError("[IronID] api_key is required.")

        self._http = HttpClient(
            api_key=api_key,
            base_url=base_url.rstrip("/"),
            timeout=timeout,
        )
        self.certifications = Certifications(self._http)
        self.verify         = Verify(self._http)
        self.keys           = Keys(self._http)

    def close(self) -> None:
        """Close the underlying HTTP client and release connections."""
        self._http.close()

    def __enter__(self) -> "IronID":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
