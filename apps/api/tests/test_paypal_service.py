"""
Unit tests for the affiliate commission calculation logic (no PayPal API calls needed).
Tests the commission rate determination based on active referral counts.
"""

import pytest
from services.affiliate_service import get_commission_rate, COMMISSION_RATES


class TestCommissionRates:
    def test_iron_tier_zero_referrals(self):
        assert get_commission_rate(0) == 0.10

    def test_iron_tier_five_referrals(self):
        assert get_commission_rate(5) == 0.10

    def test_silver_tier_six_referrals(self):
        assert get_commission_rate(6) == 0.12

    def test_silver_tier_twenty_referrals(self):
        assert get_commission_rate(20) == 0.12

    def test_gold_tier_twenty_one_referrals(self):
        assert get_commission_rate(21) == 0.15

    def test_gold_tier_fifty_referrals(self):
        assert get_commission_rate(50) == 0.20  # hits platinum at 50

    def test_platinum_tier_fifty_one_referrals(self):
        assert get_commission_rate(51) == 0.20

    def test_platinum_tier_large_count(self):
        assert get_commission_rate(1000) == 0.20

    def test_all_rates_between_0_and_1(self):
        for _, rate in COMMISSION_RATES:
            assert 0 < rate <= 1.0

    def test_commission_calculation(self):
        """Commission for a $199 payment at iron tier (10%)."""
        amount_cents = 19_900
        rate = get_commission_rate(0)
        commission = int(amount_cents * rate)
        assert commission == 1990  # $19.90
