"""
Unit tests for the API Key service (no database required).
Tests focus on key generation, hashing, verification, and display prefix logic.
"""

import pytest
from services.api_key_service import (
    KEY_PREFIX_LIVE,
    KEY_PREFIX_TEST,
    generate_raw_key,
    get_display_prefix,
    hash_key,
    verify_key,
)


class TestGenerateRawKey:
    def test_production_key_starts_with_live_prefix(self):
        key = generate_raw_key(is_production=True)
        assert key.startswith(KEY_PREFIX_LIVE)

    def test_test_key_starts_with_test_prefix(self):
        key = generate_raw_key(is_production=False)
        assert key.startswith(KEY_PREFIX_TEST)

    def test_keys_are_unique(self):
        keys = {generate_raw_key() for _ in range(100)}
        assert len(keys) == 100  # no collisions in 100 generations

    def test_key_has_sufficient_length(self):
        key = generate_raw_key()
        # prefix (9) + at least 32 chars of random
        assert len(key) >= 41


class TestHashAndVerify:
    def test_verify_correct_key(self):
        raw = generate_raw_key()
        hashed = hash_key(raw)
        assert verify_key(raw, hashed) is True

    def test_reject_wrong_key(self):
        raw = generate_raw_key()
        hashed = hash_key(raw)
        wrong = generate_raw_key()
        assert verify_key(wrong, hashed) is False

    def test_hash_is_not_reversible(self):
        raw = generate_raw_key()
        hashed = hash_key(raw)
        # Hash must not contain the raw key
        assert raw not in hashed

    def test_different_hashes_for_same_key(self):
        # bcrypt uses a random salt — same input → different hashes
        raw = generate_raw_key()
        h1 = hash_key(raw)
        h2 = hash_key(raw)
        assert h1 != h2
        # But both verify correctly
        assert verify_key(raw, h1) is True
        assert verify_key(raw, h2) is True

    def test_verify_handles_invalid_hash(self):
        assert verify_key("any_key", "not_a_valid_bcrypt_hash") is False


class TestDisplayPrefix:
    def test_display_prefix_format(self):
        raw = "iid_live_AbCdEfGhIjKlMnOpQrStUvWxYz123456"
        prefix = get_display_prefix(raw)
        assert prefix.startswith("iid_live_")
        assert prefix.endswith("...")
        # Should show only 4 chars of random part
        assert "AbCd" in prefix

    def test_display_prefix_masks_secret(self):
        raw = generate_raw_key()
        prefix = get_display_prefix(raw)
        # Full key must not appear in prefix
        assert raw not in prefix
        # Random part beyond first 4 chars must not appear
        random_part = raw.split("_", 2)[2]
        assert random_part[4:] not in prefix
