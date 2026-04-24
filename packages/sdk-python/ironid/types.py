"""IronID SDK — Typed response models."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Certification:
    id:               str
    status:           str  # pending | processing | certified | failed
    file_hash_sha256: str | None
    file_name:        str | None
    file_size_bytes:  int | None
    file_mime_type:   str | None
    c2pa_manifest:    dict[str, Any] | None
    c2pa_signature:   str | None
    certified_url:    str | None
    verification_url: str | None
    metadata:         dict[str, str]
    created_at:       str
    webhook_url:      str | None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Certification":
        return cls(
            id=data["id"],
            status=data["status"],
            file_hash_sha256=data.get("file_hash_sha256"),
            file_name=data.get("file_name"),
            file_size_bytes=data.get("file_size_bytes"),
            file_mime_type=data.get("file_mime_type"),
            c2pa_manifest=data.get("c2pa_manifest"),
            c2pa_signature=data.get("c2pa_signature"),
            certified_url=data.get("certified_url"),
            verification_url=data.get("verification_url"),
            metadata=data.get("metadata", {}),
            created_at=data["created_at"],
            webhook_url=data.get("webhook_url"),
        )


@dataclass
class CertificationsPage:
    data:      list[Certification]
    total:     int
    page:      int
    page_size: int

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CertificationsPage":
        return cls(
            data=[Certification.from_dict(c) for c in data.get("data", [])],
            total=data["total"],
            page=data["page"],
            page_size=data["page_size"],
        )


@dataclass
class VerificationResult:
    is_certified:         bool
    file_hash_sha256:     str
    certification_id:     str | None
    certified_at:         str | None
    file_name:            str | None
    file_mime_type:       str | None
    verification_url:     str | None
    c2pa_manifest:        dict[str, Any] | None
    ledger_history_count: int

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "VerificationResult":
        return cls(
            is_certified=data["is_certified"],
            file_hash_sha256=data["file_hash_sha256"],
            certification_id=data.get("certification_id"),
            certified_at=data.get("certified_at"),
            file_name=data.get("file_name"),
            file_mime_type=data.get("file_mime_type"),
            verification_url=data.get("verification_url"),
            c2pa_manifest=data.get("c2pa_manifest"),
            ledger_history_count=data.get("ledger_history_count", 0),
        )


@dataclass
class APIKey:
    id:           str
    name:         str
    key_prefix:   str
    is_active:    bool
    created_at:   str
    last_used_at: str | None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "APIKey":
        return cls(
            id=data["id"],
            name=data["name"],
            key_prefix=data["key_prefix"],
            is_active=data["is_active"],
            created_at=data["created_at"],
            last_used_at=data.get("last_used_at"),
        )


@dataclass
class CreateAPIKeyResult(APIKey):
    raw_key: str = field(default="")

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CreateAPIKeyResult":  # type: ignore[override]
        return cls(
            id=data["id"],
            name=data["name"],
            key_prefix=data["key_prefix"],
            is_active=data["is_active"],
            created_at=data["created_at"],
            last_used_at=data.get("last_used_at"),
            raw_key=data["raw_key"],
        )
