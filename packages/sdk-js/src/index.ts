/**
 * @ironid/sdk — Official JavaScript/TypeScript SDK
 *
 * @example
 * ```ts
 * import { IronID } from '@ironid/sdk';
 *
 * const client = new IronID({ apiKey: 'iid_live_...' });
 *
 * // Certify a file
 * const cert = await client.certifications.certifyAndWait({
 *   file: fs.readFileSync('photo.jpg'),
 *   filename: 'photo.jpg',
 *   metadata: { author: 'Jane Doe', location: 'Paris' },
 * });
 * console.log(cert.file_hash_sha256); // a3f5b9c1...
 *
 * // Verify by hash
 * const result = await client.verify.byHash('a3f5b9c1...');
 * console.log(result.is_certified); // true
 * ```
 */

import { Certifications } from "./resources/certifications.js";
import { Verify }          from "./resources/verify.js";
import { Keys }            from "./resources/keys.js";
import type { IronIDConfig } from "./types.js";

export { IronIDError, IronIDAuthError, IronIDRateLimitError } from "./error.js";
export * from "./types.js";

const DEFAULT_BASE_URL = "https://api.ironid.io";
const DEFAULT_TIMEOUT  = 30_000;

export class IronID {
  readonly certifications: Certifications;
  readonly verify:         Verify;
  readonly keys:           Keys;

  constructor(config: IronIDConfig) {
    if (!config.apiKey) {
      throw new Error("[IronID] apiKey is required.");
    }

    const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    const timeout = config.timeout ?? DEFAULT_TIMEOUT;

    this.certifications = new Certifications(baseUrl, config.apiKey, timeout);
    this.verify         = new Verify(baseUrl, config.apiKey, timeout);
    this.keys           = new Keys(baseUrl, config.apiKey, timeout);
  }
}
