"""
IronID — File Service.

Handles:
  - Server-side SHA-256 hash computation (streaming, memory-safe)
  - MIME type detection via magic bytes (not Content-Type header)
  - Upload to / download from Cloudflare R2 (S3-compatible)
  - Signed URL generation for private file access
  - Scheduled deletion based on plan retention policy
"""

import hashlib
import io
import mimetypes
import struct
import uuid
from datetime import timedelta

import aioboto3
import structlog
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from config import get_settings

settings = get_settings()
logger = structlog.get_logger()

# Retention period per plan (days). 0 = delete after processing.
RETENTION_DAYS: dict[str, int] = {
    "free": 0,
    "payg": 1,
    "individual": 30,
    "studio": 30,
    "enterprise": 365,
}

# Magic bytes → MIME type (server-side detection, ignores Content-Type header)
_MAGIC_MAP: list[tuple[bytes, int, str]] = [
    # offset, magic bytes, mime
    (b"\xff\xd8\xff", 0, "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", 0, "image/png"),
    (b"RIFF", 0, "image/webp"),         # also checked at offset 8: "WEBP"
    (b"GIF87a", 0, "image/gif"),
    (b"GIF89a", 0, "image/gif"),
    (b"II\x2a\x00", 0, "image/tiff"),   # little-endian TIFF
    (b"MM\x00\x2a", 0, "image/tiff"),   # big-endian TIFF
    (b"%PDF-", 0, "application/pdf"),
    (b"\x00\x00\x00\x18ftyp", 4, "video/mp4"),
    (b"\x00\x00\x00\x20ftyp", 4, "video/mp4"),
    (b"ftypqt  ", 4, "video/quicktime"),
    (b"\x1aE\xdf\xa3", 0, "video/webm"),
    (b"ID3", 0, "audio/mpeg"),
    (b"\xff\xfb", 0, "audio/mpeg"),
    (b"RIFF", 0, "audio/wav"),          # differentiated from webp by offset 8: "WAVE"
    (b"OggS", 0, "audio/ogg"),
]


def detect_mime_type(header: bytes) -> str | None:
    """
    Detect MIME type from the first 32 bytes of a file (magic bytes).
    Returns None if unrecognised.
    """
    for magic, offset, mime in _MAGIC_MAP:
        end = offset + len(magic)
        if len(header) >= end and header[offset:end] == magic:
            # Disambiguate RIFF containers (WebP vs WAV)
            if magic == b"RIFF" and len(header) >= 12:
                subtype = header[8:12]
                if subtype == b"WEBP":
                    return "image/webp"
                if subtype == b"WAVE":
                    return "audio/wav"
                return None
            return mime
    return None


async def compute_sha256(file: UploadFile) -> tuple[str, bytes]:
    """
    Stream through an UploadFile computing SHA-256 and buffering content.
    Returns (hex_hash, full_content_bytes).
    """
    hasher = hashlib.sha256()
    chunks: list[bytes] = []

    await file.seek(0)
    while chunk := await file.read(65536):  # 64 KB chunks
        hasher.update(chunk)
        chunks.append(chunk)

    await file.seek(0)
    return hasher.hexdigest(), b"".join(chunks)


def _get_r2_client():
    """Return an aioboto3 S3 client configured for Cloudflare R2."""
    session = aioboto3.Session()
    return session.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
    )


async def upload_to_r2(
    content: bytes,
    object_key: str,
    mime_type: str,
    metadata: dict[str, str] | None = None,
) -> str:
    """
    Upload bytes to Cloudflare R2.

    Args:
        content: Raw file bytes.
        object_key: R2 object key (e.g. "certified/cert_xxx.jpg").
        mime_type: MIME type for Content-Type header.
        metadata: Optional string key-value pairs stored as S3 metadata.

    Returns:
        Public URL of the uploaded object.
    """
    async with _get_r2_client() as client:
        try:
            await client.put_object(
                Bucket=settings.r2_bucket_name,
                Key=object_key,
                Body=content,
                ContentType=mime_type,
                Metadata=metadata or {},
            )
        except (BotoCoreError, ClientError) as exc:
            logger.error("r2_upload_failed", key=object_key, error=str(exc))
            raise RuntimeError(f"R2 upload failed: {exc}") from exc

    public_url = f"{settings.r2_public_url}/{object_key}"
    logger.info("r2_upload_success", key=object_key, url=public_url)
    return public_url


async def delete_from_r2(object_key: str) -> None:
    """Delete an object from R2 (used for free-tier cleanup)."""
    async with _get_r2_client() as client:
        try:
            await client.delete_object(Bucket=settings.r2_bucket_name, Key=object_key)
            logger.info("r2_delete_success", key=object_key)
        except (BotoCoreError, ClientError) as exc:
            logger.error("r2_delete_failed", key=object_key, error=str(exc))


async def generate_presigned_url(object_key: str, expires_in: int = 3600) -> str:
    """
    Generate a pre-signed download URL for a private R2 object.

    Args:
        object_key: The R2 object key.
        expires_in: URL validity in seconds (default: 1 hour).
    """
    async with _get_r2_client() as client:
        url = await client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.r2_bucket_name, "Key": object_key},
            ExpiresIn=expires_in,
        )
    return url


def build_r2_key(certification_id: uuid.UUID, file_name: str, stage: str = "certified") -> str:
    """
    Build a deterministic R2 object key.
    Format: <stage>/<cert_id>/<original_filename>
    """
    safe_name = file_name.replace(" ", "_")
    return f"{stage}/{certification_id}/{safe_name}"


async def validate_and_read_upload(
    file: UploadFile,
    plan: str,
) -> tuple[str, bytes, str]:
    """
    Validate an uploaded file (size, MIME type) then compute its SHA-256.

    Args:
        file: The FastAPI UploadFile.
        plan: User's subscription plan (for size limit).

    Returns:
        (sha256_hex, content_bytes, detected_mime_type)

    Raises:
        ValueError: If file fails validation.
    """
    max_size = settings.MAX_FILE_SIZE.get(plan, settings.MAX_FILE_SIZE["free"])

    # Read header for magic-byte detection
    await file.seek(0)
    header = await file.read(32)
    await file.seek(0)

    detected_mime = detect_mime_type(header)
    if not detected_mime or detected_mime not in settings.ALLOWED_MIME_TYPES:
        raise ValueError(
            f"Unsupported file type. Detected: {detected_mime or 'unknown'}."
        )

    # Stream entire file computing hash + checking size
    hasher = hashlib.sha256()
    chunks: list[bytes] = []
    total = 0

    await file.seek(0)
    while chunk := await file.read(65536):
        total += len(chunk)
        if total > max_size:
            raise ValueError(
                f"File exceeds {max_size // (1024 * 1024)} MB limit for '{plan}' plan."
            )
        hasher.update(chunk)
        chunks.append(chunk)

    await file.seek(0)
    sha256_hex = hasher.hexdigest()
    content = b"".join(chunks)
    return sha256_hex, content, detected_mime
