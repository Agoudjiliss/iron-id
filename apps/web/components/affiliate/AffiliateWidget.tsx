"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Users, TrendingUp, DollarSign, Copy, Check, ExternalLink, ChevronRight } from "lucide-react";
import { getAffiliateLink, getAffiliateStats, type AffiliateLinkResponse, type AffiliateStats } from "@/lib/api";
import { cn } from "@/lib/utils";

// ---- Tier config ----

const TIER_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Iron:     { color: "text-iron-white/60",  bg: "bg-iron-border/60",    label: "Iron"     },
  Bronze:   { color: "text-amber-400",       bg: "bg-amber-400/10",      label: "Bronze"   },
  Silver:   { color: "text-slate-300",       bg: "bg-slate-300/10",      label: "Silver"   },
  Gold:     { color: "text-iron-gold",       bg: "bg-iron-gold/10",      label: "Gold"     },
  Platinum: { color: "text-purple-400",      bg: "bg-purple-400/10",     label: "Platinum" },
};

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// ---- Link copy button ----

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-iron-gold/10 text-iron-gold hover:bg-iron-gold/20 transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ---- Stat card ----

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-iron-slate border border-iron-border rounded-2xl p-4 flex flex-col gap-2">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent ?? "bg-iron-border/60")}>
        <Icon size={16} className={accent ? "text-iron-gold" : "text-iron-white/40"} />
      </div>
      <p className="text-xl font-bold text-iron-white">{value}</p>
      <p className="text-xs text-iron-white/40">{label}</p>
      {sub && <p className="text-xs text-iron-white/25">{sub}</p>}
    </div>
  );
}

// ---- Main widget ----

export function AffiliateWidget() {
  const { getToken } = useAuth();
  const t = useTranslations("affiliate");
  const [link, setLink]   = useState<AffiliateLinkResponse | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken().then((token) => {
      if (!token) { setError("Session expired."); return; }
      Promise.all([getAffiliateLink(token), getAffiliateStats(token)])
        .then(([l, s]) => { setLink(l); setStats(s); })
        .catch((e) => setError(e.message ?? t("widgetLoadError")));
    });
  }, [getToken]);

  if (error) {
    return (
      <div className="bg-iron-slate border border-iron-red/30 rounded-2xl p-6 text-iron-red text-sm">
        {error}
      </div>
    );
  }

  const tier   = stats ? (TIER_CONFIG[stats.tier] ?? TIER_CONFIG.Iron) : null;
  const nextT  = stats?.next_tier;
  const progress = nextT && stats
    ? Math.min(100, Math.round((stats.active_referrals / nextT.required) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="bg-iron-slate border border-iron-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-iron-white">Your referral link</h2>
          {tier && (
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", tier.bg, tier.color)}>
              {tier.label} — {stats ? Math.round(stats.commission_rate * 100) : 0}%
            </span>
          )}
        </div>

        {link ? (
          <div className="flex items-center gap-3 bg-iron-black/50 border border-iron-border rounded-xl px-4 py-3">
            <ExternalLink size={14} className="text-iron-white/30 flex-shrink-0" />
            <span className="flex-1 text-sm text-iron-white/70 truncate font-mono">{link.link}</span>
            <CopyButton text={link.link} />
          </div>
        ) : (
          <div className="h-12 bg-iron-border/30 rounded-xl animate-pulse" />
        )}

        <p className="mt-3 text-xs text-iron-white/30">
          Last-click attribution · {link?.cookie_days ?? 90}-day cookie · Code: <span className="font-mono text-iron-white/50">{link?.code ?? "…"}</span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats ? (
          <>
            <StatCard
              icon={Users}
              label="Active referrals"
              value={String(stats.active_referrals)}
              sub={`${stats.total_referrals} total`}
              accent="bg-iron-gold/10"
            />
            <StatCard
              icon={DollarSign}
              label="Pending earnings"
              value={formatCents(stats.pending_cents)}
              sub="Payment D+30"
              accent="bg-iron-gold/10"
            />
            <StatCard
              icon={DollarSign}
              label={t("alreadyPaid")}
              value={formatCents(stats.paid_cents)}
            />
            <StatCard
              icon={TrendingUp}
              label="Total earned"
              value={formatCents(stats.total_earned_cents)}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-iron-slate border border-iron-border rounded-2xl animate-pulse" />
          ))
        )}
      </div>

      {/* Tier progress */}
      {stats && nextT && (
        <div className="bg-iron-slate border border-iron-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-iron-white">Progress toward {nextT.name}</h3>
            <span className="text-xs text-iron-white/40">
              {stats.active_referrals} / {nextT.required} {t("activeReferrals")}
            </span>
          </div>
          <div className="relative h-2 bg-iron-border rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-iron-gold rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-iron-white/30 flex items-center gap-1">
            <ChevronRight size={10} />
            {nextT.name} unlocks {Math.round(nextT.rate * 100)}% commission
          </p>
        </div>
      )}

      {stats && !nextT && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 text-sm text-purple-300">
          {t("platinumReached")}
        </div>
      )}
    </div>
  );
}
