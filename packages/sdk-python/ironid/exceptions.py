"""IronID SDK — Exception hierarchy."""


class IronIDError(Exception):
    """Base exception for all IronID SDK errors."""

    def __init__(self, message: str, code: str = "UNKNOWN", status: int = 0) -> None:
        super().__init__(message)
        self.code   = code
        self.status = status

    def __repr__(self) -> str:  # pragma: no cover
        return f"{self.__class__.__name__}(message={str(self)!r}, code={self.code!r}, status={self.status})"


class IronIDAuthError(IronIDError):
    """Raised when the API key is invalid or missing."""

    def __init__(self, message: str = "Invalid or missing API key.") -> None:
        super().__init__(message, code="UNAUTHORIZED", status=401)


class IronIDRateLimitError(IronIDError):
    """Raised when the rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded. Retry after a moment.") -> None:
        super().__init__(message, code="RATE_LIMITED", status=429)


class IronIDTimeoutError(IronIDError):
    """Raised when a request times out."""

    def __init__(self, message: str = "Request timed out.") -> None:
        super().__init__(message, code="TIMEOUT", status=0)
