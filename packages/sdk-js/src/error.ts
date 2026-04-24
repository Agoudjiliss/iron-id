export class IronIDError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "IronIDError";
  }
}

export class IronIDAuthError extends IronIDError {
  constructor(message = "Invalid or missing API key.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "IronIDAuthError";
  }
}

export class IronIDRateLimitError extends IronIDError {
  constructor(message = "Rate limit exceeded. Retry after a moment.") {
    super(message, "RATE_LIMITED", 429);
    this.name = "IronIDRateLimitError";
  }
}
