"""
Unit tests for the C2PA Service — manifest building and signature verification.
No database, no network required.
"""

import uuid
from datetime import datetime, timezone

import pytest

from services.c2pa_service import (
    build_c2pa_manifest,
    certify_file,
    get_public_key_pem,
    sign_manifest,
    verify_manifest_signature,
)


SAMPLE_HASH = "a3f5b9c1d2e4f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
SAMPLE_CERT_ID = uuid.UUID("12345678-1234-5678-1234-567812345678")


class TestBuildManifest:
    def test_manifest_has_required_fields(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="test.jpg",
            file_mime_type="image/jpeg",
            file_size_bytes=1024,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={},
            certified_at=datetime.now(tz=timezone.utc),
        )
        assert "claim_generator" in manifest
        assert "assertions" in manifest
        assert "title" in manifest
        assert manifest["title"] == "test.jpg"

    def test_hash_in_assertions(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="photo.png",
            file_mime_type="image/png",
            file_size_bytes=2048,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={},
            certified_at=datetime.now(tz=timezone.utc),
        )
        hash_assertion = next(
            (a for a in manifest["assertions"] if a["label"] == "c2pa.hash.data"), None
        )
        assert hash_assertion is not None
        assert hash_assertion["data"]["hash"] == SAMPLE_HASH
        assert hash_assertion["data"]["algorithm"] == "sha256"

    def test_user_metadata_included(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="doc.pdf",
            file_mime_type="application/pdf",
            file_size_bytes=4096,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={"author": "Alice", "location": "Paris"},
            certified_at=datetime.now(tz=timezone.utc),
        )
        assert "ironid_certification_id" in manifest["metadata"]
        assert "verification_url" in manifest["metadata"]
        # user metadata assertions added
        metadata_assertion = next(
            (a for a in manifest["assertions"] if a["label"] == "c2pa.metadata"), None
        )
        assert metadata_assertion is not None
        assert metadata_assertion["data"]["author"] == "Alice"

    def test_no_metadata_assertion_when_empty(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="video.mp4",
            file_mime_type="video/mp4",
            file_size_bytes=1000000,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={},
            certified_at=datetime.now(tz=timezone.utc),
        )
        metadata_assertion = next(
            (a for a in manifest["assertions"] if a["label"] == "c2pa.metadata"), None
        )
        assert metadata_assertion is None


class TestSignatureVerification:
    def test_sign_and_verify(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="test.jpg",
            file_mime_type="image/jpeg",
            file_size_bytes=1024,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={},
            certified_at=datetime.now(tz=timezone.utc),
        )
        signature = sign_manifest(manifest)
        assert verify_manifest_signature(manifest, signature) is True

    def test_tampered_manifest_fails_verification(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="test.jpg",
            file_mime_type="image/jpeg",
            file_size_bytes=1024,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={},
            certified_at=datetime.now(tz=timezone.utc),
        )
        signature = sign_manifest(manifest)

        # Tamper with the manifest
        manifest["title"] = "tampered.jpg"
        assert verify_manifest_signature(manifest, signature) is False

    def test_invalid_signature_rejected(self):
        manifest = build_c2pa_manifest(
            file_hash_sha256=SAMPLE_HASH,
            file_name="test.jpg",
            file_mime_type="image/jpeg",
            file_size_bytes=1024,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={},
            certified_at=datetime.now(tz=timezone.utc),
        )
        assert verify_manifest_signature(manifest, "not_a_valid_signature==") is False

    def test_certify_file_returns_manifest_and_signature(self):
        manifest, signature = certify_file(
            file_hash_sha256=SAMPLE_HASH,
            file_name="photo.jpg",
            file_mime_type="image/jpeg",
            file_size_bytes=8192,
            certification_id=SAMPLE_CERT_ID,
            user_metadata={"caption": "Test photo"},
        )
        assert isinstance(manifest, dict)
        assert isinstance(signature, str)
        assert len(signature) > 0
        # Signature must verify against the returned manifest
        assert verify_manifest_signature(manifest, signature) is True


class TestPublicKey:
    def test_public_key_is_pem(self):
        pem = get_public_key_pem()
        assert pem.startswith("-----BEGIN PUBLIC KEY-----")
        assert "-----END PUBLIC KEY-----" in pem
