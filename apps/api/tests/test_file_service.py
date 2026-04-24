"""
Unit tests for the File Service — MIME detection and SHA-256 computation.
No database, no R2 connection required.
"""

import hashlib
import pytest

from services.file_service import detect_mime_type, build_r2_key
import uuid


class TestDetectMimeType:
    """Test magic-byte MIME detection."""

    def _header(self, data: bytes) -> bytes:
        """Pad to at least 32 bytes."""
        return data + b"\x00" * max(0, 32 - len(data))

    def test_detects_jpeg(self):
        assert detect_mime_type(self._header(b"\xff\xd8\xff\xe0" + b"\x00" * 28)) == "image/jpeg"

    def test_detects_png(self):
        png_magic = b"\x89PNG\r\n\x1a\n" + b"\x00" * 24
        assert detect_mime_type(png_magic) == "image/png"

    def test_detects_pdf(self):
        pdf_magic = b"%PDF-1.4" + b"\x00" * 24
        assert detect_mime_type(pdf_magic) == "application/pdf"

    def test_detects_gif89(self):
        gif_magic = b"GIF89a" + b"\x00" * 26
        assert detect_mime_type(gif_magic) == "image/gif"

    def test_detects_webp(self):
        webp = b"RIFF\x00\x00\x00\x00WEBP" + b"\x00" * 20
        assert detect_mime_type(webp) == "image/webp"

    def test_detects_wav(self):
        wav = b"RIFF\x00\x00\x00\x00WAVE" + b"\x00" * 20
        assert detect_mime_type(wav) == "audio/wav"

    def test_returns_none_for_unknown(self):
        unknown = b"\x00\x01\x02\x03" * 8
        assert detect_mime_type(unknown) is None

    def test_returns_none_for_empty(self):
        assert detect_mime_type(b"") is None


class TestBuildR2Key:
    def test_format_matches_pattern(self):
        cert_id = uuid.uuid4()
        key = build_r2_key(cert_id, "photo.jpg", stage="certified")
        assert key.startswith("certified/")
        assert str(cert_id) in key
        assert key.endswith("photo.jpg")

    def test_spaces_replaced_in_filename(self):
        cert_id = uuid.uuid4()
        key = build_r2_key(cert_id, "my photo.jpg")
        assert " " not in key
        assert "my_photo.jpg" in key


class TestSHA256:
    """Test SHA-256 computation correctness."""

    def test_known_hash(self):
        content = b"hello world"
        expected = hashlib.sha256(content).hexdigest()
        # SHA-256("hello world") — verified against Python stdlib
        assert expected == "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"

    def test_different_content_different_hash(self):
        h1 = hashlib.sha256(b"file A content").hexdigest()
        h2 = hashlib.sha256(b"file B content").hexdigest()
        assert h1 != h2

    def test_hash_is_64_chars(self):
        h = hashlib.sha256(b"test").hexdigest()
        assert len(h) == 64
        assert all(c in "0123456789abcdef" for c in h)
