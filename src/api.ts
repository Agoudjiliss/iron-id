export interface ProtectResponse {
  job_id: string;
  message: string;
  ws_url: string;
}

export interface JobResult {
  output_path: string;
  original_hash: string;
  protected_hash: string;
  watermark_token: string;
  manifest_id: string;
  psnr: number | null;
  delta_e: number | null;
  processing_time: number | null;
  layers_applied: string[];
  file_type: string;
  error: string | null;
  report_url?: string;
  qr_code_base64?: string;
}

export interface VerifyResponse {
  status: "authentic" | "modified" | "unverified" | "suspect";
  watermark_found: boolean;
  watermark_confidence: number;
  c2pa_valid: boolean;
  author: string | null;
  original_date: string | null;
  modifications_detected: boolean;
  details: Record<string, unknown>;
}

const DEFAULT_API_BASE = "https://iron-id-ea601dce55ce.herokuapp.com";
const API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/$/, "");
const WS_BASE = API_BASE.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");

function buildApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

async function handleResponse(res: Response, fallback = "Request failed") {
  const err = await res.json().catch(() => ({ detail: res.statusText }));
  const d = err.detail;
  const msg = Array.isArray(d) ? d.map((e: { msg?: string }) => (e && typeof e === "object" && "msg" in e ? e.msg : String(e))).join(". ") : (typeof d === "string" ? d : fallback);
  throw new Error(msg || fallback);
}

export async function protectFile(
  file: File,
  metadata: Record<string, string>,
  protectionLevel: string
): Promise<ProtectResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("metadata", JSON.stringify(metadata));
  form.append("protection_level", protectionLevel);

  try {
    const res = await fetch(buildApiUrl("/api/protect"), {
      method: "POST",
      body: form,
    });
    if (!res.ok) await handleResponse(res, "Protection request failed");
    return res.json();
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error("Cannot reach the server. Check your connection and try again.");
    }
    throw e;
  }
}

export async function getJobResult(jobId: string): Promise<JobResult> {
  const res = await fetch(
    `${buildApiUrl(`/api/protect/result/${jobId}`)}?base_url=${encodeURIComponent(window.location.origin)}`
  );
  if (!res.ok) {
    throw new Error(`Job not ready (${res.status})`);
  }
  return res.json();
}

export async function verifyFile(file: File): Promise<VerifyResponse> {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(buildApiUrl("/api/verify/upload"), {
      method: "POST",
      body: form,
    });
    if (!res.ok) await handleResponse(res, "Verification request failed");
    return res.json();
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error("Cannot reach the server. Check your connection and try again.");
    }
    throw e;
  }
}

export function connectProgress(
  jobId: string,
  onMessage: (data: Record<string, unknown>) => void,
  onDone: (result: JobResult) => void,
  onError: (err: string) => void,
  wsUrl?: string
) {
  const trimmedWsUrl = wsUrl?.trim();
  let normalizedWsUrl: string;
  if (!trimmedWsUrl) {
    normalizedWsUrl = `${WS_BASE}/api/ws/progress/${jobId}`;
  } else if (/^wss?:\/\//i.test(trimmedWsUrl)) {
    normalizedWsUrl = trimmedWsUrl;
  } else if (/^https?:\/\//i.test(trimmedWsUrl)) {
    normalizedWsUrl = trimmedWsUrl.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
  } else {
    // Relative path from backend — prepend WS_BASE (Heroku) directly, Vercel doesn't support WebSocket
    const path = trimmedWsUrl.startsWith("/") ? trimmedWsUrl : `/${trimmedWsUrl}`;
    normalizedWsUrl = `${WS_BASE}${path}`;
  }
  const ws = new WebSocket(normalizedWsUrl);
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    onMessage(data);
    if (data.step === "done" && data.result) {
      onDone(data.result as JobResult);
    }
  };
  ws.onerror = () => onError("WebSocket connection failed");
  ws.onclose = () => {};
  return ws;
}

export function getDownloadUrl(outputPath: string): string {
  const filename = outputPath.split("/").pop();
  return buildApiUrl(`/uploads/${filename}`);
}

export interface FeedbackPayload {
  name: string;
  email: string;
  message: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<{ ok: boolean; id?: string }> {
  try {
    const res = await fetch(`/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.detail) ? data.detail.map((e: { msg?: string }) => e?.msg || String(e)).join(". ") : (data.detail || res.statusText || "Failed to send feedback");
      throw new Error(msg);
    }
    return data;
  } catch (e) {
    if (e instanceof TypeError && e.message === "Failed to fetch") {
      throw new Error("Cannot reach the server. Check your connection and try again.");
    }
    throw e;
  }
}
