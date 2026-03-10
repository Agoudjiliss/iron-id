import type { IncomingMessage, ServerResponse } from "http";

const BACKEND_URL = (
  process.env.VITE_API_URL || "https://iron-id-ea601dce55ce.herokuapp.com"
).replace(/\/$/, "");

const RETRY_DELAY_MS = 4000;

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString("utf-8"); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function tryProxy(body: string): Promise<{ status: number; data: unknown }> {
  const maxAttempts = 2;
  let lastStatus = 503;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      lastStatus = res.status;
      const data = await res.json().catch(() => ({}));
      if (res.status === 503 && attempt < maxAttempts - 1) continue;
      return { status: res.status, data };
    } catch {
      // connection error — retry
    }
  }
  return { status: lastStatus, data: { detail: "Backend service is temporarily unavailable. Please try again in a few seconds." } };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ detail: "Method not allowed" }));
    return;
  }

  try {
    const body = await readBody(req);
    const { status, data } = await tryProxy(body);
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  } catch {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ detail: "Could not reach backend service." }));
  }
}

export const config = {
  maxDuration: 30,
};
