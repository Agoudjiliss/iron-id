import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ContactPayload {
  firstName:   string;
  lastName:    string;
  email:       string;
  company:     string;
  role:        string;
  useCase:     string;
  volume:      string;
  message:     string;
  ndaRequired: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: ContactPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, company, message } = body;

  if (!email || !company || !message?.trim()) {
    return NextResponse.json(
      { error: "email, company and message are required" },
      { status: 422 }
    );
  }

  // ── Send email via Resend ──────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // In development: just log and return success
    console.log("[enterprise-contact]", JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  }

  const name    = [body.firstName, body.lastName].filter(Boolean).join(" ") || email;
  const subject = `[Enterprise] ${company} — ${body.useCase || "General enquiry"}`;

  const html = `
    <h2>Enterprise trial application</h2>
    <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;font-size:14px;">
      <tr><td><strong>Name</strong></td><td>${name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${email}</td></tr>
      <tr><td><strong>Company</strong></td><td>${company}</td></tr>
      <tr><td><strong>Role</strong></td><td>${body.role || "—"}</td></tr>
      <tr><td><strong>Use case</strong></td><td>${body.useCase || "—"}</td></tr>
      <tr><td><strong>Volume</strong></td><td>${body.volume || "—"}</td></tr>
      <tr><td><strong>NDA required</strong></td><td>${body.ndaRequired ? "Yes" : "No"}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    "IronID Enterprise <noreply@iron-id.io>",
        to:      ["enterprise@iron-id.io"],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[enterprise-contact] resend error:", err);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[enterprise-contact] fetch error:", err);
    return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
