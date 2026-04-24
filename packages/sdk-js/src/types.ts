// ---- Client config ----

export interface IronIDConfig {
  /** API key — iid_live_... or iid_test_... */
  apiKey: string;
  /** Base URL override (default: https://api.ironid.io) */
  baseUrl?: string;
  /** Request timeout in ms (default: 30 000) */
  timeout?: number;
}

// ---- Certifications ----

export type CertificationStatus =
  | "pending"
  | "processing"
  | "certified"
  | "failed";

export interface Certification {
  id:                  string;
  status:              CertificationStatus;
  file_hash_sha256:    string | null;
  file_name:           string | null;
  file_size_bytes:     number | null;
  file_mime_type:      string | null;
  c2pa_manifest:       Record<string, unknown> | null;
  c2pa_signature:      string | null;
  certified_url:       string | null;
  verification_url:    string | null;
  metadata:            Record<string, string>;
  created_at:          string;
  webhook_url:         string | null;
}

export interface CertifyOptions {
  /** File contents as a Buffer, Blob, or File */
  file:        Buffer | Blob | File;
  /** Filename including extension */
  filename:    string;
  /** Arbitrary key/value metadata embedded in the C2PA manifest */
  metadata?:   Record<string, string>;
  /** Webhook URL to receive a POST when certification completes */
  webhookUrl?: string;
}

export interface ListCertificationsOptions {
  page?:     number;
  pageSize?: number;
  status?:   CertificationStatus;
}

export interface CertificationsPage {
  data:      Certification[];
  total:     number;
  page:      number;
  page_size: number;
}

// ---- Verification ----

export interface VerificationResult {
  is_certified:          boolean;
  file_hash_sha256:      string;
  certification_id:      string | null;
  certified_at:          string | null;
  file_name:             string | null;
  file_mime_type:        string | null;
  verification_url:      string | null;
  c2pa_manifest:         Record<string, unknown> | null;
  ledger_history_count:  number;
}

// ---- API Keys ----

export interface APIKey {
  id:           string;
  name:         string;
  key_prefix:   string;
  is_active:    boolean;
  created_at:   string;
  last_used_at: string | null;
}

export interface CreateAPIKeyOptions {
  name:         string;
  environment?: "production" | "test";
}

export interface CreateAPIKeyResult extends APIKey {
  /** Raw key — shown only once, store securely */
  raw_key: string;
}

// ---- Errors ----

export interface APIErrorBody {
  error: string;
  code:  string;
}
