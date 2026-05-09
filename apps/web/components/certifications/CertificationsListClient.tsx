"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
} from "lucide-react";
import {
  listCertifications,
  type Certification,
  type CertificationStatus,
} from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HashBadge } from "@/components/ui/HashBadge";
import { cn, formatBytes, formatDate } from "@/lib/utils";

const PAGE_SIZE = 15;

export function CertificationsListClient() {
  const { getToken } = useAuth();
  const t = useTranslations("certifications");
  const tStatus = useTranslations("status");
  const tCommon = useTranslations("common");

  const STATUS_OPTIONS: { value: CertificationStatus | "all"; label: string }[] = [
    { value: "all",        label: tStatus("all")        },
    { value: "certified",  label: tStatus("certified")  },
    { value: "pending",    label: tStatus("pending")    },
    { value: "processing", label: tStatus("processing") },
    { value: "failed",     label: tStatus("failed")     },
  ];

  const [certs, setCerts] = useState<Certification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { setError(t("sessionExpired")); setLoading(false); return; }
      const res = await listCertifications(token, {
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setCerts(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, getToken]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-iron-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as CertificationStatus | "all"); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-iron-slate border border-iron-border text-sm text-iron-white focus:outline-none focus:border-iron-gold/50 transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-iron-white/40">
          {total} certification{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-iron-white/40 text-sm">
            <Loader2 size={16} className="animate-spin" />
            {tCommon("loading")}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-iron-red text-sm">
            {error}
          </div>
        ) : certs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-iron-white/40">
            <CheckCircle size={28} className="text-iron-border mb-3" />
            <p className="text-sm">{t("noResults")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-iron-border">
                  {[t("colFile"), t("colHash"), t("colStatus"), t("colDate"), t("colActions")].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-iron-white/40 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-border/50">
                {certs.map((cert) => (
                  <CertRow key={cert.id} cert={cert} verifyLabel={t("verifyPage")} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-iron-white/50 hover:text-iron-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> {t("previous")}
          </button>
          <span className="text-xs text-iron-white/40">
            {t("page")} {page} {t("of")} {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-iron-white/50 hover:text-iron-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t("next")} <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function CertRow({ cert, verifyLabel }: { cert: Certification; verifyLabel: string }) {
  return (
    <tr className="hover:bg-iron-border/20 transition-colors group">
      <td className="px-4 py-3 max-w-[200px]">
        <p className="truncate font-medium text-iron-white text-sm" title={cert.file_name ?? undefined}>
          {cert.file_name ?? "—"}
        </p>
        {cert.file_size_bytes && (
          <p className="text-xs text-iron-white/40">{formatBytes(cert.file_size_bytes)}</p>
        )}
      </td>

      <td className="px-4 py-3">
        {cert.file_hash_sha256 ? (
          <HashBadge hash={cert.file_hash_sha256} chars={6} />
        ) : (
          <span className="text-iron-white/30 text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={cert.status} size="sm" />
      </td>

      <td className="px-4 py-3 text-xs text-iron-white/50 whitespace-nowrap">
        {formatDate(cert.created_at)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {cert.file_hash_sha256 && (
            <a
              href={`/verify/${cert.file_hash_sha256}`}
              target="_blank"
              rel="noopener noreferrer"
              title={verifyLabel}
              className="p-1.5 rounded-lg text-iron-white/40 hover:text-iron-gold hover:bg-iron-gold/10 transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
