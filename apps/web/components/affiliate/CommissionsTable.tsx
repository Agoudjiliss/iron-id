"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { getCommissions, type Commission, type CommissionsListResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<Commission["status"], string> = {
  pending:   "bg-amber-500/10 text-amber-400",
  paid:      "bg-iron-green/10 text-iron-green",
  cancelled: "bg-iron-red/10 text-iron-red",
};

const STATUS_LABELS: Record<Commission["status"], string> = {
  pending:   "En attente",
  paid:      "Payé",
  cancelled: "Annulé",
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "USD" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export function CommissionsTable() {
  const [data,   setData]   = useState<CommissionsListResponse | null>(null);
  const [page,   setPage]   = useState(1);
  const [filter, setFilter] = useState<Commission["status"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCommissions({
        page,
        pageSize: PAGE_SIZE,
        status: filter === "all" ? undefined : filter,
      });
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur chargement commissions");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="bg-iron-slate border border-iron-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-iron-border">
        <h2 className="text-sm font-semibold text-iron-white">Historique des commissions</h2>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as Commission["status"] | "all"); setPage(1); }}
            className="text-xs bg-iron-black border border-iron-border rounded-lg px-2.5 py-1.5 text-iron-white/70 focus:outline-none focus:border-iron-gold/50"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="paid">Payés</option>
            <option value="cancelled">Annulés</option>
          </select>

          {/* Refresh */}
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg text-iron-white/40 hover:text-iron-white hover:bg-iron-border/50 transition-colors disabled:opacity-30"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {error ? (
          <div className="px-5 py-10 text-center text-sm text-iron-red">{error}</div>
        ) : !data || loading ? (
          <div className="divide-y divide-iron-border/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-3.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className={cn("h-4 bg-iron-border/50 rounded animate-pulse", j === 0 ? "w-28" : "w-20")} />
                ))}
              </div>
            ))}
          </div>
        ) : data.data.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-iron-white/30">
            Aucune commission trouvée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-iron-white/30 border-b border-iron-border/50">
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-right px-5 py-3 font-medium">Montant vente</th>
                <th className="text-right px-5 py-3 font-medium">Commission</th>
                <th className="text-center px-5 py-3 font-medium">Taux</th>
                <th className="text-center px-5 py-3 font-medium">Statut</th>
                <th className="text-left px-5 py-3 font-medium">Payé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-border/30">
              {data.data.map((c) => (
                <tr key={c.id} className="hover:bg-iron-border/10 transition-colors">
                  <td className="px-5 py-3.5 text-iron-white/60 tabular-nums">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-iron-white font-mono">
                    {formatCents(c.amount_cents)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-iron-gold font-mono font-semibold">
                    {formatCents(c.commission_cents)}
                  </td>
                  <td className="px-5 py-3.5 text-center text-iron-white/50">
                    {Math.round(c.commission_rate * 100)}%
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_STYLES[c.status],
                    )}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-iron-white/40 tabular-nums">
                    {c.paid_at ? formatDate(c.paid_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-iron-border/50">
          <span className="text-xs text-iron-white/30">
            {data.total} commission{data.total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-iron-white/40 hover:text-iron-white hover:bg-iron-border/50 transition-colors disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-iron-white/50">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-iron-white/40 hover:text-iron-white hover:bg-iron-border/50 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
