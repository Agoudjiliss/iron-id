"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminKey, adminFetch } from "../layout";
import { PageShell, Spinner } from "../_components";
import { Search, ChevronLeft, ChevronRight, Edit2, Check, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  plan: string;
  monthly_signatures_used: number;
  monthly_signatures_limit: number;
  trial_ends_at: string | null;
  trial_active: boolean;
  created_at: string;
}

const PLAN_OPTIONS = ["free", "payg", "individual", "studio", "enterprise"];

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-iron-border/50 text-iron-white/50",
  payg:       "bg-blue-500/20 text-blue-400",
  individual: "bg-iron-gold/20 text-iron-gold",
  studio:     "bg-purple-500/20 text-purple-400",
  enterprise: "bg-green-500/20 text-green-400",
};

export default function AdminUsers() {
  const key = useAdminKey();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [saving, setSaving] = useState(false);

  const PAGE_SIZE = 50;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(PAGE_SIZE),
    });
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);

    adminFetch(`/v1/admin/users?${params}`, key)
      .then((r) => r.json())
      .then((d) => { setUsers(d.data ?? []); setTotal(d.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [key, page, search, planFilter]);

  useEffect(() => { load(); }, [load]);

  function startEdit(u: User) {
    setEditing(u.id);
    setEditPlan(u.plan);
    setEditLimit(String(u.monthly_signatures_limit));
  }

  async function saveEdit(userId: string) {
    setSaving(true);
    try {
      await adminFetch(`/v1/admin/users/${userId}`, key, {
        method: "PATCH",
        body: JSON.stringify({
          plan: editPlan,
          monthly_signatures_limit: parseInt(editLimit, 10),
        }),
      });
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <PageShell title={`Users (${total})`}>
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-iron-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-iron-border bg-iron-black/40 text-iron-white text-sm placeholder:text-iron-white/20 focus:outline-none focus:border-iron-gold/40"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-iron-border bg-iron-black/40 text-iron-white text-sm focus:outline-none focus:border-iron-gold/40"
        >
          <option value="">All plans</option>
          {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="rounded-2xl border border-iron-border bg-iron-slate overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-iron-border bg-iron-black/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Sigs used / limit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Trial</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-iron-white/40">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-iron-black/20 transition-colors">
                    <td className="px-4 py-3 text-iron-white/80 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <select
                          value={editPlan}
                          onChange={(e) => setEditPlan(e.target.value)}
                          className="px-2 py-1 rounded-lg border border-iron-border bg-iron-black text-iron-white text-xs focus:outline-none"
                        >
                          {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[u.plan] ?? PLAN_COLORS.free}`}>
                          {u.plan}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-iron-white/50 text-xs">
                      {editing === u.id ? (
                        <input
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          className="w-24 px-2 py-1 rounded-lg border border-iron-border bg-iron-black text-iron-white text-xs focus:outline-none"
                          type="number"
                        />
                      ) : (
                        `${u.monthly_signatures_used} / ${u.monthly_signatures_limit === -1 ? "∞" : u.monthly_signatures_limit}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.trial_active ? (
                        <span className="text-xs text-green-400 font-medium">
                          Active · {new Date(u.trial_ends_at!).toLocaleDateString()}
                        </span>
                      ) : u.trial_ends_at ? (
                        <span className="text-xs text-iron-white/25">Expired</span>
                      ) : (
                        <span className="text-xs text-iron-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-iron-white/30 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {editing === u.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => saveEdit(u.id)}
                            disabled={saving}
                            className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 rounded-lg text-iron-white/30 hover:text-iron-gold hover:bg-iron-gold/10 transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-iron-border">
              <span className="text-xs text-iron-white/30">
                Page {page} / {pages} · {total} users
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-iron-border text-iron-white/40 hover:text-iron-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="p-1.5 rounded-lg border border-iron-border text-iron-white/40 hover:text-iron-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
