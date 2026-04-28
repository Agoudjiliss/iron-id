"use client";

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const USE_CASES = [
  "Media / Journalism",
  "Legal & Digital Evidence",
  "Generative AI Platform",
  "Government / Public Sector",
  "Camera / Hardware",
  "Social Media Platform",
  "Healthcare / Medical Imaging",
  "Other",
];

const VOLUME_OPTIONS = [
  "< 10 000 / month",
  "10 000 – 100 000 / month",
  "100 000 – 1 M / month",
  "> 1 M / month",
  "Not sure yet",
];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  useCase: string;
  volume: string;
  message: string;
  ndaRequired: boolean;
}

const INITIAL: FormState = {
  firstName:   "",
  lastName:    "",
  email:       "",
  company:     "",
  role:        "",
  useCase:     "",
  volume:      "",
  message:     "",
  ndaRequired: false,
};

export function EnterpriseContactForm() {
  const [form, setForm]       = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  function update(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.email || !form.company || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Submit to public email / contact API
      // Falls back to mailto if API unavailable
      const res = await fetch("/api/enterprise-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Submission failed. Please email enterprise@iron-id.io directly.");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-iron-gold/20 bg-iron-gold/5 p-10 text-center">
        <CheckCircle size={40} className="text-iron-gold mx-auto mb-4" />
        <h3 className="text-xl font-bold text-iron-white mb-2">Application received</h3>
        <p className="text-iron-white/50 text-sm leading-relaxed">
          Our enterprise team will review your application and respond within
          one business day. Check your inbox — we may ask for a brief discovery call.
        </p>
        <p className="text-iron-white/30 text-xs mt-4">
          In the meantime, feel free to reach us at{" "}
          <a href="mailto:enterprise@iron-id.io" className="text-iron-gold underline">
            enterprise@iron-id.io
          </a>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-iron-border bg-iron-slate p-8 space-y-5"
    >
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" required>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            placeholder="Jean"
            className={inputCls}
          />
        </Field>
        <Field label="Last name" required>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            placeholder="Dupont"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Work email" required>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="jean@company.com"
          className={inputCls}
          required
        />
      </Field>

      {/* Company + Role */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company" required>
          <input
            type="text"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Acme Corp"
            className={inputCls}
            required
          />
        </Field>
        <Field label="Your role">
          <input
            type="text"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="CTO, Head of Product…"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Use case */}
      <Field label="Primary use case">
        <select
          value={form.useCase}
          onChange={(e) => update("useCase", e.target.value)}
          className={inputCls}
        >
          <option value="">Select a sector…</option>
          {USE_CASES.map((uc) => (
            <option key={uc} value={uc}>{uc}</option>
          ))}
        </select>
      </Field>

      {/* Volume */}
      <Field label="Expected certification volume">
        <select
          value={form.volume}
          onChange={(e) => update("volume", e.target.value)}
          className={inputCls}
        >
          <option value="">Select a range…</option>
          {VOLUME_OPTIONS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </Field>

      {/* Message */}
      <Field label="Tell us about your project" required>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Describe your current workflow, what you're trying to certify, your timeline, and any technical constraints…"
          className={`${inputCls} resize-none`}
          required
        />
      </Field>

      {/* NDA checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={form.ndaRequired}
            onChange={(e) => update("ndaRequired", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-4 h-4 rounded border border-iron-border peer-checked:bg-iron-gold peer-checked:border-iron-gold transition-colors" />
          {form.ndaRequired && (
            <svg
              className="absolute inset-0 w-4 h-4 text-iron-black"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <span className="text-xs text-iron-white/50 leading-relaxed">
          I require a mutual NDA / confidentiality agreement before discussing
          technical or commercial details.
        </span>
      </label>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-iron-gold text-iron-black font-bold text-sm hover:bg-iron-gold/90 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit enterprise application"
        )}
      </button>

      <p className="text-center text-xs text-iron-white/25">
        We respond within 1 business day. No spam, no auto-sales sequences.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-iron-white/60">
        {label}
        {required && <span className="text-iron-gold ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-iron-border bg-iron-black/40 text-iron-white text-sm placeholder:text-iron-white/20 focus:outline-none focus:border-iron-gold/50 transition-colors";
