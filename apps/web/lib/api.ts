/**
 * IronID API Client
 * Typed wrapper around the FastAPI backend.
 * Uses Next.js rewrites: /api/v1/* → FastAPI /v1/*
 */

const API_BASE = "/api/v1";

// ---- Types ----

export type CertificationStatus = "pending" | "processing" | "certified" | "failed";

export interface Certification {
  id: string;
  status: CertificationStatus;
  file_hash_sha256: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  file_mime_type: string | null;
  c2pa_manifest: Record<string, unknown> | null;
  c2pa_signature: string | null;
  certified_url: string | null;
  verification_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  webhook_url: string | null;
}

export interface VerificationResult {
  is_certified: boolean;
  file_hash_sha256: string;
  certification_id: string | null;
  certified_at: string | null;
  file_name: string | null;
  file_mime_type: string | null;
  verification_url: string | null;
  c2pa_manifest: Record<string, unknown> | null;
  ledger_history_count: number;
}

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export interface APIError {
  error: string;
  code: string;
}

// ---- Helpers ----

async function request<T>(
  path: string,
  options: RequestInit & { apiKey?: string } = {},
): Promise<T> {
  const { apiKey, ...init } = options;
  const headers = new Headers(init.headers);

  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  headers.set("Accept", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as APIError;
    throw new IronIDError(
      body.error ?? `Request failed with status ${res.status}`,
      body.code ?? "UNKNOWN",
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

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

// ---- Verification (public — no API key required) ----

/** Verify a file by uploading it. Computes SHA-256 server-side. */
export async function verifyByUpload(file: File): Promise<VerificationResult> {
  const form = new FormData();
  form.append("file", file);
  return request<VerificationResult>("/verify", { method: "POST", body: form });
}

/** Lookup a file's certification by its SHA-256 hash (no auth). */
export async function verifyByHash(hash: string): Promise<VerificationResult> {
  return request<VerificationResult>(`/verify/${encodeURIComponent(hash)}`);
}

// ---- Certifications (requires Clerk session token) ----

/** Submit a file for certification. Returns 202 Accepted immediately. */
export async function certifyFile(
  file: File,
  options: {
    sessionToken: string;
    metadata?: Record<string, string>;
    webhookUrl?: string;
  },
): Promise<Certification> {
  const form = new FormData();
  form.append("file", file);
  form.append("metadata", JSON.stringify(options.metadata ?? {}));
  if (options.webhookUrl) form.append("webhook_url", options.webhookUrl);

  return request<Certification>("/certify", {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${options.sessionToken}` },
  });
}

/** Poll the status of a certification. */
export async function getCertification(
  id: string,
  sessionToken: string,
): Promise<Certification> {
  return request<Certification>(`/certify/${id}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

/** List all certifications (paginated). */
export async function listCertifications(
  sessionToken: string,
  params?: { page?: number; pageSize?: number; status?: CertificationStatus },
): Promise<{ data: Certification[]; total: number; page: number; page_size: number }> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.status) q.set("status_filter", params.status);
  return request(`/certifications?${q}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

// ---- API Keys (requires Clerk session token) ----

/** Create a new API key. Returns the raw key once — store it securely. */
export async function createAPIKey(
  name: string,
  environment: "production" | "test" = "production",
  sessionToken: string,
): Promise<APIKey & { raw_key: string }> {
  return request("/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify({ name, environment }),
  });
}

/** List all API keys for the current user. */
export async function listAPIKeys(sessionToken: string): Promise<APIKey[]> {
  return request("/keys", { headers: { Authorization: `Bearer ${sessionToken}` } });
}

/** Revoke an API key. */
export async function revokeAPIKey(id: string, sessionToken: string): Promise<void> {
  return request(`/keys/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

// ---- Affiliate (requires Clerk session token) ----

export interface AffiliateLinkResponse {
  code:        string;
  link:        string;
  cookie_days: number;
  attribution: string;
}

export interface AffiliateStats {
  code:                 string;
  tier:                 string;
  commission_rate:      number;
  total_referrals:      number;
  active_referrals:     number;
  pending_cents:        number;
  paid_cents:           number;
  total_earned_cents:   number;
  next_tier:            { name: string; required: number; rate: number } | null;
}

export interface Commission {
  id:               string;
  referred_user_id: string;
  amount_cents:     number;
  commission_cents: number;
  commission_rate:  number;
  status:           "pending" | "paid" | "cancelled";
  created_at:       string;
  paid_at:          string | null;
}

export interface CommissionsListResponse {
  data:      Commission[];
  total:     number;
  page:      number;
  page_size: number;
}

/** Get (or generate) the authenticated user's referral link. */
export async function getAffiliateLink(sessionToken: string): Promise<AffiliateLinkResponse> {
  return request("/affiliate/link", { headers: { Authorization: `Bearer ${sessionToken}` } });
}

/** Get the full affiliate stats snapshot. */
export async function getAffiliateStats(sessionToken: string): Promise<AffiliateStats> {
  return request("/affiliate/stats", { headers: { Authorization: `Bearer ${sessionToken}` } });
}

/** List paginated commissions. */
export async function getCommissions(sessionToken: string, params?: {
  page?:   number;
  pageSize?: number;
  status?: "pending" | "paid" | "cancelled";
}): Promise<CommissionsListResponse> {
  const q = new URLSearchParams();
  if (params?.page)     q.set("page",      String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.status)   q.set("status",    params.status);
  return request(`/affiliate/commissions?${q}`, { headers: { Authorization: `Bearer ${sessionToken}` } });
}
