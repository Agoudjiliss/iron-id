import { request } from "../http.js";
import type { APIKey, CreateAPIKeyOptions, CreateAPIKeyResult } from "../types.js";

export class Keys {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeout: number,
  ) {}

  /** Create a new API key. The raw key is returned once — store it securely. */
  async create(options: CreateAPIKeyOptions): Promise<CreateAPIKeyResult> {
    return request<CreateAPIKeyResult>(this.baseUrl, this.apiKey, "/v1/keys", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: options.name, environment: options.environment ?? "production" }),
      timeout: this.timeout,
    });
  }

  /** List all API keys for the authenticated user. */
  async list(): Promise<APIKey[]> {
    return request<APIKey[]>(this.baseUrl, this.apiKey, "/v1/keys", {
      timeout: this.timeout,
    });
  }

  /** Revoke an API key by ID. */
  async revoke(id: string): Promise<void> {
    return request<void>(this.baseUrl, this.apiKey, `/v1/keys/${encodeURIComponent(id)}`, {
      method:  "DELETE",
      timeout: this.timeout,
    });
  }
}
