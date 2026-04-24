import { request } from "../http.js";
import type {
  Certification,
  CertificationsPage,
  CertifyOptions,
  ListCertificationsOptions,
} from "../types.js";

export class Certifications {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeout: number,
  ) {}

  /**
   * Submit a file for C2PA certification.
   * Returns 202 Accepted — poll `get(id)` or use a webhook for completion.
   */
  async create(options: CertifyOptions): Promise<Certification> {
    const form = new FormData();

    if (options.file instanceof Buffer) {
      form.append("file", new Blob([options.file]), options.filename);
    } else {
      form.append("file", options.file as Blob, options.filename);
    }

    form.append("metadata", JSON.stringify(options.metadata ?? {}));
    if (options.webhookUrl) form.append("webhook_url", options.webhookUrl);

    return request<Certification>(this.baseUrl, this.apiKey, "/v1/certify", {
      method: "POST",
      body: form,
      timeout: this.timeout,
    });
  }

  /**
   * Poll the status of a certification by ID.
   */
  async get(id: string): Promise<Certification> {
    return request<Certification>(
      this.baseUrl,
      this.apiKey,
      `/v1/certify/${encodeURIComponent(id)}`,
      { timeout: this.timeout },
    );
  }

  /**
   * List certifications with optional pagination and status filter.
   */
  async list(options: ListCertificationsOptions = {}): Promise<CertificationsPage> {
    const q = new URLSearchParams();
    if (options.page)     q.set("page",          String(options.page));
    if (options.pageSize) q.set("page_size",      String(options.pageSize));
    if (options.status)   q.set("status_filter",  options.status);

    return request<CertificationsPage>(
      this.baseUrl,
      this.apiKey,
      `/v1/certifications?${q}`,
      { timeout: this.timeout },
    );
  }

  /**
   * Submit a file and poll until certified (or failed).
   * Convenience wrapper around create + get with exponential backoff.
   */
  async certifyAndWait(
    options: CertifyOptions,
    pollOptions: { intervalMs?: number; maxAttempts?: number } = {},
  ): Promise<Certification> {
    const { intervalMs = 2000, maxAttempts = 30 } = pollOptions;
    const cert = await this.create(options);

    for (let i = 0; i < maxAttempts; i++) {
      const updated = await this.get(cert.id);
      if (updated.status === "certified" || updated.status === "failed") {
        return updated;
      }
      await sleep(intervalMs * Math.min(2 ** i, 8)); // cap at 8× base
    }

    throw new Error(`Certification ${cert.id} did not complete after ${maxAttempts} polls.`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
