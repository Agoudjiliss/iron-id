"use client";

import { useState } from "react";
import { useAdminKey, adminFetch } from "../_components";
import { PageShell } from "../_components";
import { Gift, CheckCircle, Search } from "lucide-react";

interface TrialResult {
  email: string;
  plan: string;
  monthly_signatures_limit: number;
  trial_ends_at: string | null;
  trial_active: boolean;
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-iron-border bg-iron-black/40 text-iron-white text-sm placeholder:text-iron-white/20 focus:outline-none focus:border-iron-gold/50";

export default function AdminTrials() {
  const key = useAdminKey();

  // Grant trial
  const [grantEmail, setGrantEmail] = useState("");
  const [grantDays, setGrantDays]   = useState("30");
  const [grantNote, setGrantNote]   = useState("");
  const [granting, setGranting]     = useState(false);
  const [grantResult, setGrantResult] = useState<TrialResult | null>(null);
  const [grantError, setGrantError]  = useState("");

  // Check status
  const [checkEmail, setCheckEmail]   = useState("");
  const [checking, setChecking]       = useState(false);
  const [checkResult, setCheckResult] = useState<TrialResult | null>(null);
  const [checkError, setCheckError]   = useState("");

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setGranting(true);
    setGrantError("");
    setGrantResult(null);
    try {
      const res = await adminFetch("/v1/admin/grant-trial", key, {
        method: "POST",
        body: JSON.stringify({
          email: grantEmail,
          days: parseInt(grantDays) || 30,
          note: grantNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGrantError(data?.detail?.error ?? "Failed to grant trial");
      } else {
        setGrantResult(data);
        setGrantEmail("");
        setGrantNote("");
      }
    } catch {
      setGrantError("Network error");
    } finally {
      setGranting(false);
    }
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setCheckError("");
    setCheckResult(null);
    try {
      const res = await adminFetch(`/v1/admin/trial-status?email=${encodeURIComponent(checkEmail)}`, key);
      const data = await res.json();
      if (!res.ok) {
        setCheckError(data?.detail?.error ?? "User not found");
      } else {
        setCheckResult(data);
      }
    } catch {
      setCheckError("Network error");
    } finally {
      setChecking(false);
    }
  }

  return (
    <PageShell title="Enterprise Trials">
      <div className="grid md:grid-cols-2 gap-6">

        {/* Grant trial */}
        <div className="rounded-2xl border border-iron-border bg-iron-slate p-6 space-y-4">
          <h2 className="text-sm font-bold text-iron-white flex items-center gap-2">
            <Gift size={14} className="text-iron-gold" /> Grant enterprise trial
          </h2>
          <form onSubmit={handleGrant} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">User email *</label>
              <input
                type="email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="user@company.com"
                className={inputCls}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Duration (days)</label>
              <input
                type="number"
                value={grantDays}
                onChange={(e) => setGrantDays(e.target.value)}
                min="1"
                max="365"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Internal note</label>
              <input
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                placeholder="Partnership deal, marketing campaign…"
                className={inputCls}
              />
            </div>
            {grantError && <p className="text-red-400 text-xs">{grantError}</p>}
            {grantResult && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-green-400 font-semibold">Trial granted!</p>
                  <p className="text-iron-white/50 mt-0.5">
                    {grantResult.email} → <strong>{grantResult.plan}</strong><br />
                    Expires: {grantResult.trial_ends_at ? new Date(grantResult.trial_ends_at).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={granting}
              className="w-full py-2.5 rounded-xl bg-iron-gold text-iron-black font-semibold text-sm hover:bg-iron-gold/90 disabled:opacity-50 transition-colors"
            >
              {granting ? "Granting…" : "Grant trial"}
            </button>
          </form>
        </div>

        {/* Check trial status */}
        <div className="rounded-2xl border border-iron-border bg-iron-slate p-6 space-y-4">
          <h2 className="text-sm font-bold text-iron-white flex items-center gap-2">
            <Search size={14} className="text-iron-gold" /> Check trial status
          </h2>
          <form onSubmit={handleCheck} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">User email *</label>
              <input
                type="email"
                value={checkEmail}
                onChange={(e) => setCheckEmail(e.target.value)}
                placeholder="user@company.com"
                className={inputCls}
                required
              />
            </div>
            {checkError && <p className="text-red-400 text-xs">{checkError}</p>}
            {checkResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${checkResult.trial_active ? "bg-green-500/10 border-green-500/20" : "bg-iron-black/30 border-iron-border"}`}>
                <p className="font-semibold text-iron-white">{checkResult.email}</p>
                <p><span className="text-iron-white/40">Plan:</span> <strong className="text-iron-white">{checkResult.plan}</strong></p>
                <p>
                  <span className="text-iron-white/40">Trial:</span>{" "}
                  {checkResult.trial_active ? (
                    <span className="text-green-400 font-semibold">Active → {new Date(checkResult.trial_ends_at!).toLocaleDateString()}</span>
                  ) : checkResult.trial_ends_at ? (
                    <span className="text-red-400">Expired ({new Date(checkResult.trial_ends_at).toLocaleDateString()})</span>
                  ) : (
                    <span className="text-iron-white/30">No trial</span>
                  )}
                </p>
                <p><span className="text-iron-white/40">Sig. limit:</span> {checkResult.monthly_signatures_limit === -1 ? "Unlimited" : checkResult.monthly_signatures_limit}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={checking}
              className="w-full py-2.5 rounded-xl border border-iron-border text-iron-white font-semibold text-sm hover:border-iron-gold/40 hover:text-iron-gold disabled:opacity-50 transition-colors"
            >
              {checking ? "Checking…" : "Check status"}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
