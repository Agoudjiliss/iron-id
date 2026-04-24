"""
IronID — C2PA Service.

Implements a C2PA-compatible manifest system for content provenance.
This is an IronID-native implementation that follows the C2PA specification
(https://c2pa.org/specifications/specifications/1.3/specs/C2PA_Specification.html).

The manifest is structured as a signed JSON document embedded in file metadata.
For production, the signing key should be an X.509 certificate from a trusted CA.
For now, we use ECDSA P-256 (the C2PA recommended algorithm) with a self-managed key.

NOTE: Full C2PA compliance (embedding into file binary) requires the `c2pa-python`
native library. This service generates the manifest and signature; embedding is
deferred to Module 7 (SDK) when c2pa-python is integrated.
"""

import base64
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timezone

import structlog
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
from cryptography.exceptions import InvalidSignature

from config import get_settings

settings = get_settings()
logger = structlog.get_logger()

# C2PA Claim Generator identifier
CLAIM_GENERATOR = "IronID/1.0 (https://ironid.io)"


def _load_or_generate_signing_key() -> ec.EllipticCurvePrivateKey:
    """
    Load the ECDSA P-256 signing key from environment or generate an ephemeral one.
    In production, APP_SECRET_KEY seeds a deterministic key derivation.
    """
    # Derive a 32-byte seed from the app secret
    seed = hashlib.sha256(settings.app_secret_key.encode()).digest()
    # Use the seed as the private value (simplified — production should use HSM or KMS)
    private_int = int.from_bytes(seed, "big") % (
        0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551  # n for P-256
    )
    if private_int == 0:
        private_int = 1
    return ec.derive_private_key(private_int, ec.SECP256R1())


_SIGNING_KEY = _load_or_generate_signing_key()
_VERIFYING_KEY = _SIGNING_KEY.public_key()


def build_c2pa_manifest(
    *,
    file_hash_sha256: str,
    file_name: str,
    file_mime_type: str,
    file_size_bytes: int,
    certification_id: uuid.UUID,
    user_metadata: dict,
    certified_at: datetime,
) -> dict:
    """
    Build a C2PA-compatible manifest document.

    The manifest follows the C2PA Claim structure:
    - claim_generator: software that created this claim
    - title: human-readable title
    - assertions: verifiable statements about the asset
    - created_at: ISO 8601 timestamp

    Returns:
        A dict representing the full C2PA manifest (JSON-serialisable).
    """
    manifest = {
        "claim_generator": CLAIM_GENERATOR,
        "claim_generator_info": [
            {
                "name": "IronID",
                "version": "1.0",
                "home_page": "https://ironid.io",
            }
        ],
        "title": file_name,
        "format": file_mime_type,
        "instance_id": f"xmp:iid:{certification_id}",
        "created_at": certified_at.isoformat(),
        "assertions": [
            {
                "label": "c2pa.hash.data",
                "data": {
                    "algorithm": "sha256",
                    "hash": file_hash_sha256,
                    "file_size_bytes": file_size_bytes,
                },
            },
            {
                "label": "c2pa.thumbnail.claim.jpeg",
                "data": {
                    "mime_type": file_mime_type,
                    "file_name": file_name,
                },
            },
        ],
        "metadata": {
            "ironid_certification_id": str(certification_id),
            "verification_url": f"https://ironid.io/verify/{file_hash_sha256}",
            **{k: str(v) for k, v in user_metadata.items()},
        },
    }

    # Add optional user-provided metadata as assertions
    if user_metadata:
        manifest["assertions"].append(
            {
                "label": "c2pa.metadata",
                "data": user_metadata,
            }
        )

    return manifest


def sign_manifest(manifest: dict) -> str:
    """
    Sign the manifest with ECDSA P-256 (SHA-256).

    The signature covers the canonical JSON of the manifest.
    Returns the base64url-encoded DER signature.
    """
    canonical = json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode()
    signature = _SIGNING_KEY.sign(canonical, ec.ECDSA(hashes.SHA256()))
    return base64.urlsafe_b64encode(signature).decode()


def verify_manifest_signature(manifest: dict, signature_b64: str) -> bool:
    """
    Verify a manifest signature using the IronID public key.

    Returns True if the signature is valid, False otherwise.
    """
    try:
        canonical = json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode()
        signature = base64.urlsafe_b64decode(signature_b64)
        _VERIFYING_KEY.verify(signature, canonical, ec.ECDSA(hashes.SHA256()))
        return True
    except (InvalidSignature, Exception):
        return False


def get_public_key_pem() -> str:
    """Return the IronID public key in PEM format (for external verification)."""
    return _VERIFYING_KEY.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()


def certify_file(
    *,
    file_hash_sha256: str,
    file_name: str,
    file_mime_type: str,
    file_size_bytes: int,
    certification_id: uuid.UUID,
    user_metadata: dict,
) -> tuple[dict, str]:
    """
    Build and sign a C2PA manifest for a file.

    Returns:
        (manifest: dict, signature: str)
    """
    certified_at = datetime.now(tz=timezone.utc)

    manifest = build_c2pa_manifest(
        file_hash_sha256=file_hash_sha256,
        file_name=file_name,
        file_mime_type=file_mime_type,
        file_size_bytes=file_size_bytes,
        certification_id=certification_id,
        user_metadata=user_metadata,
        certified_at=certified_at,
    )
    signature = sign_manifest(manifest)

    logger.info(
        "c2pa_manifest_created",
        certification_id=str(certification_id),
        hash=file_hash_sha256[:16],
        mime=file_mime_type,
    )
    return manifest, signature
