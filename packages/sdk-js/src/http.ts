import { IronIDError, IronIDAuthError, IronIDRateLimitError } from "./error.js";
import type { APIErrorBody } from "./types.js";

export interface RequestOptions {
  method?:  "GET" | "POST" | "DELETE";
  body?:    BodyInit;
  headers?: Record<string, string>;
  timeout?: number;
}

export async function request<T>(
  baseUrl: string,
  apiKey: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, timeout = 30_000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    body,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...headers,
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({})) as APIErrorBody & Record<string, unknown>;

  if (!res.ok) {
    if (res.status === 401) throw new IronIDAuthError(data.error);
    if (res.status === 429) throw new IronIDRateLimitError(data.error);
    throw new IronIDError(
      data.error ?? `Request failed with status ${res.status}`,
      data.code  ?? "UNKNOWN",
      res.status,
    );
  }

  return data as T;
}
