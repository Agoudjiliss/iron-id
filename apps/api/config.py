"""
IronID API — Application Configuration
Loads all environment variables with validation via Pydantic Settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_env: str = "development"
    app_secret_key: str
    admin_secret_key: str = ""  # Required for admin endpoints (POST /v1/admin/*)
    frontend_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:3000"

    # Database
    database_url: str

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Clerk
    clerk_secret_key: str
    clerk_publishable_key: str
    clerk_webhook_secret: str

    # PayPal
    paypal_client_id: str = ""
    paypal_client_secret: str = ""
    paypal_webhook_id: str = ""
    paypal_mode: str = "sandbox"          # "sandbox" | "live"
    paypal_plan_individual_monthly: str = ""
    paypal_plan_individual_yearly: str = ""
    paypal_plan_studio_monthly: str = ""
    paypal_plan_studio_yearly: str = ""
    paypal_plan_enterprise_monthly: str = ""
    paypal_plan_enterprise_yearly: str = ""

    @property
    def paypal_api_base(self) -> str:
        if self.paypal_mode == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"

    # Pay-as-you-go: price per signature in USD (cents)
    PAYG_PRICE_CENTS: int = 10  # $0.10

    # Cloudflare R2
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "ironid-files"
    r2_public_url: str = ""

    # Resend
    resend_api_key: str = ""
    email_from: str = "noreply@ironid.io"

    # Monitoring
    sentry_dsn: str = ""
    posthog_api_key: str = ""

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    # Rate limits per plan (requests per minute)
    RATE_LIMITS: dict[str, int] = {
        "free": 10,
        "payg": 100,
        "individual": 500,
        "studio": 1000,
        "enterprise": 2000,
    }

    # Signature limits per plan (per month, -1 = unlimited)
    SIGNATURE_LIMITS: dict[str, int] = {
        "free": 10,
        "payg": -1,
        "individual": 10_000,
        "studio": 100_000,
        "enterprise": -1,
    }

    # Max file size per plan (bytes)
    MAX_FILE_SIZE: dict[str, int] = {
        "free": 50 * 1024 * 1024,         # 50 MB
        "payg": 100 * 1024 * 1024,         # 100 MB
        "individual": 200 * 1024 * 1024,   # 200 MB
        "studio": 500 * 1024 * 1024,       # 500 MB
        "enterprise": 500 * 1024 * 1024,   # 500 MB
    }

    ALLOWED_MIME_TYPES: frozenset[str] = frozenset({
        "image/jpeg", "image/png", "image/webp", "image/gif", "image/tiff",
        "video/mp4", "video/quicktime", "video/webm",
        "application/pdf",
        "audio/mpeg", "audio/wav", "audio/ogg",
    })


@lru_cache
def get_settings() -> Settings:
    """Return cached settings singleton."""
    return Settings()
