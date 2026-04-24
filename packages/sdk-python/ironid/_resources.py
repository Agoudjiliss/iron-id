"""IronID SDK — Resource classes (Certifications, Verify, Keys)."""

from __future__ import annotations

import io
import json
import time
from pathlib import Path
from typing import IO, TYPE_CHECKING

from .types import (
    APIKey,
    Certification,
    CertificationsPage,
    CreateAPIKeyResult,
    VerificationResult,
)

if TYPE_CHECKING:
    from ._http import HttpClient


class Certifications:
    def __init__(self, http: "HttpClient") -> None:
        self._http = http

    def create(
        self,
        file: bytes | IO[bytes] | Path,
        filename: str,
        *,
        metadata: dict[str, str] | None = None,
        webhook_url: str | None = None,
    ) -> Certification:
        """
        Submit a file for C2PA certification.
        Returns 202 Accepted — poll `get(id)` or use a webhook for completion.
        """
        if isinstance(file, Path):
            file_bytes = file.read_bytes()
            filename   = filename or file.name
        elif isinstance(file, bytes):
            file_bytes = file
        else:
            file_bytes = file.read()

        files: dict = {"file": (filename, io.BytesIO(file_bytes))}
        data: dict  = {"metadata": json.dumps(metadata or {})}
        if webhook_url:
            data["webhook_url"] = webhook_url

        raw = self._http.post("/v1/certify", files=files, data=data)
        return Certification.from_dict(raw)

    def get(self, certification_id: str) -> Certification:
        """Poll the status of a certification by ID."""
        raw = self._http.get(f"/v1/certify/{certification_id}")
        return Certification.from_dict(raw)

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
    ) -> CertificationsPage:
        """List certifications with optional pagination and status filter."""
        params = f"?page={page}&page_size={page_size}"
        if status:
            params += f"&status_filter={status}"
        raw = self._http.get(f"/v1/certifications{params}")
        return CertificationsPage.from_dict(raw)

    def certify_and_wait(
        self,
        file: bytes | IO[bytes] | Path,
        filename: str,
        *,
        metadata: dict[str, str] | None = None,
        webhook_url: str | None = None,
        interval: float = 2.0,
        max_attempts: int = 30,
    ) -> Certification:
        """
        Submit a file and poll until certified (or failed).
        Convenience wrapper around create + get.
        """
        cert = self.create(file, filename, metadata=metadata, webhook_url=webhook_url)
        for i in range(max_attempts):
            updated = self.get(cert.id)
            if updated.status in ("certified", "failed"):
                return updated
            time.sleep(min(interval * (2 ** i), interval * 8))
        raise TimeoutError(f"Certification {cert.id} did not complete after {max_attempts} polls.")


class Verify:
    def __init__(self, http: "HttpClient") -> None:
        self._http = http

    def by_file(
        self,
        file: bytes | IO[bytes] | Path,
        filename: str = "file",
    ) -> VerificationResult:
        """Verify a file by uploading it."""
        if isinstance(file, Path):
            file_bytes = file.read_bytes()
            filename   = file.name
        elif isinstance(file, bytes):
            file_bytes = file
        else:
            file_bytes = file.read()

        raw = self._http.post(
            "/v1/verify",
            files={"file": (filename, io.BytesIO(file_bytes))},
        )
        return VerificationResult.from_dict(raw)

    def by_hash(self, sha256_hash: str) -> VerificationResult:
        """Look up a file's certification by its SHA-256 hash."""
        raw = self._http.get(f"/v1/verify/{sha256_hash}")
        return VerificationResult.from_dict(raw)


class Keys:
    def __init__(self, http: "HttpClient") -> None:
        self._http = http

    def create(self, name: str, *, environment: str = "production") -> CreateAPIKeyResult:
        """Create a new API key. The raw key is returned once — store it securely."""
        raw = self._http.post("/v1/keys", json={"name": name, "environment": environment})
        return CreateAPIKeyResult.from_dict(raw)

    def list(self) -> list[APIKey]:
        """List all API keys for the authenticated user."""
        raw = self._http.get("/v1/keys")
        return [APIKey.from_dict(k) for k in raw]

    def revoke(self, key_id: str) -> None:
        """Revoke an API key by ID."""
        self._http.delete(f"/v1/keys/{key_id}")
