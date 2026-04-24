import { request } from "../http.js";
import type { VerificationResult } from "../types.js";

export class Verify {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly timeout: number,
  ) {}

  /**
   * Verify a file by uploading it.
   * No API key required for public verification.
   */
  async byFile(file: Buffer | Blob | File, filename?: string): Promise<VerificationResult> {
    const form = new FormData();
    if (file instanceof Buffer) {
      form.append("file", new Blob([file]), filename ?? "file");
    } else {
      form.append("file", file as Blob, filename ?? (file instanceof File ? file.name : "file"));
    }

    return request<VerificationResult>(this.baseUrl, this.apiKey, "/v1/verify", {
      method: "POST",
      body: form,
      timeout: this.timeout,
    });
  }

  /**
   * Look up a file's certification by its SHA-256 hash.
   * No API key required.
   */
  async byHash(hash: string): Promise<VerificationResult> {
    return request<VerificationResult>(
      this.baseUrl,
      this.apiKey,
      `/v1/verify/${encodeURIComponent(hash)}`,
      { timeout: this.timeout },
    );
  }
}
