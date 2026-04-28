"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminKey, adminFetch } from "../layout";
import { PageShell, Spinner } from "../_components";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  plan: string;
  signatures_bonus: number;
  duration_days: number | null;
  max_uses: number | null;
  expires_at: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  redemptions_count: number;
}

const PLAN_OPTIONS = ["free", "payg", "individual", "studio", "enterprise"];

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-iron-border/50 text-iron-white/50",
  payg:       "bg-blue-500/20 text-blue-400",
  individual: "bg-iron-gold/20 text-iron-gold",
  studio:     "bg-purple-500/20 text-purple-400",
  enterprise: "bg-green-500/20 text-green-400",
};

const inputCls = "w-full px-3 py-2 rounded-xl border border-iron-border bg-iron-black/40 text-iron-white text-sm placeholder:text-iron-white/20 focus:outline-none focus:border-iron-gold/50";

export default function AdminCoupons() {
  const key = useAdminKey();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "", plan: "individual", signatures_bonus: "0",
    duration_days: "", max_uses: "", expires_at: "", description: "",
  });
  const [createError, setCreateError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminFetch("/v1/admin/coupons", key)
      .then((r) => r.json())
      .then((d) => setCoupons(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [key]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase().replace(/\s/g, "_"),
        plan: form.plan,
        signatures_bonus: parseInt(form.signatures_bonus) || 0,
      };
      if (form.duration_days) body.duration_days = parseInt(form.duration_days);
      if (form.max_uses) body.max_uses = parseInt(form.max_uses);
      if (form.expires_at) body.expires_at = new Date(form.expires_at).toISOString();
      if (form.description) body.description = form.description;

      const res = await adminFetch("/v1/admin/coupons", key, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setCreateError(err?.detail?.error ?? "Failed to create coupon");
      } else {
        setShowCreate(false);
        setForm({ code: "", plan: "individual", signatures_bonus: "0", duration_days: "", max_uses: "", expires_at: "", description: "" });
        load();
      }
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(code: string, current: boolean) {
    await adminFetch(`/v1/admin/coupons/${code}`, key, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !current }),
    });
    load();
  }

  async function deleteCoupon(code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;
    setDeleting(code);
    await adminFetch(`/v1/admin/coupons/${code}`, key, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  return (
    <PageShell title={`Coupons (${coupons.length})`}>
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-iron-gold text-iron-black font-semibold text-sm hover:bg-iron-gold/90 transition-colors"
        >
          <Plus size={14} />
          New coupon
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-iron-gold/20 bg-iron-slate p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-iron-white flex items-center gap-2">
            <Tag size={14} className="text-iron-gold" /> Create coupon
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="PROMO2026"
                className={inputCls}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Plan granted *</label>
              <select
                value={form.plan}
                onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                className={inputCls}
              >
                {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Sig. bonus (0 = none, -1 = unlimited)</label>
              <input
                type="number"
                value={form.signatures_bonus}
                onChange={(e) => setForm((f) => ({ ...f, signatures_bonus: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Duration (days, blank = permanent)</label>
              <input
                type="number"
                value={form.duration_days}
                onChange={(e) => setForm((f) => ({ ...f, duration_days: e.target.value }))}
                placeholder="30"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Max uses (blank = unlimited)</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                placeholder="100"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Expires at (blank = never)</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-iron-white/50">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Internal note…"
                className={inputCls}
              />
            </div>
          </div>
          {createError && <p className="text-red-400 text-xs">{createError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl bg-iron-gold text-iron-black font-semibold text-sm hover:bg-iron-gold/90 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-5 py-2 rounded-xl border border-iron-border text-iron-white/50 text-sm hover:text-iron-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? <Spinner /> : (
        <div className="rounded-2xl border border-iron-border bg-iron-slate overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-iron-border bg-iron-black/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Uses</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Expires</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-border/40">
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-iron-white/30 text-sm">
                    No coupons yet.
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-iron-black/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-iron-gold text-xs">{c.code}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[c.plan] ?? PLAN_COLORS.free}`}>
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-iron-white/50 text-xs">
                    {c.redemptions_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-iron-white/40 text-xs">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-iron-white/40 text-xs max-w-[200px] truncate">
                    {c.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c.code, c.is_active)}
                      className={c.is_active ? "text-green-400 hover:text-green-300" : "text-iron-white/25 hover:text-iron-white/50"}
                    >
                      {c.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteCoupon(c.code)}
                      disabled={deleting === c.code}
                      className="p-1.5 rounded-lg text-iron-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
