"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyUsage {
  date: string;
  count: number;
}

interface UsageStats {
  used: number;
  limit: number;
  plan: string;
  daily: DailyUsage[];
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  payg: "Pay-as-you-go",
  individual: "Individual",
  studio: "Studio",
  enterprise: "Enterprise",
};

function formatDay(isoDate: string, locale: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="text-iron-white/60 mb-1">{label}</p>
      <p className="text-iron-gold font-bold">
        {payload[0].value} signature{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function UsageClient() {
  const { getToken } = useAuth();
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");

  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken().then(async (token) => {
      if (!token) { setError(t("sessionExpired")); setLoading(false); return; }
      try {
        const res = await fetch("/api/v1/usage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setStats({
          ...data,
          daily: (data.daily as { date: string; count: number }[]).map((d) => ({
            date: formatDay(d.date, "en-US"),
            count: d.count,
          })),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : t("loadErrorGeneric"));
      } finally {
        setLoading(false);
      }
    });
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-iron-white/40 text-sm">
        <Loader2 size={16} className="animate-spin" />
        {tCommon("loading")}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-iron-red text-sm">
        {error ?? tCommon("error")}
      </div>
    );
  }

  const usagePct =
    stats.limit > 0 ? Math.min(100, Math.round((stats.used / stats.limit) * 100)) : 0;

  const barColor =
    usagePct > 90 ? "#FF4757" : usagePct > 70 ? "#D4AF37" : "#00D26A";

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = lastDay - today.getDate();
  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const signaturesLeftText = stats.limit - stats.used > 0
    ? `${(stats.limit - stats.used).toLocaleString()} signatures remaining this month`
    : t("quotaReached");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Zap size={16} className="text-iron-gold" />}
          label={t("signaturesUsed")}
          value={stats.used.toLocaleString()}
          sub={`${t("on")} ${stats.limit === -1 ? "∞" : stats.limit.toLocaleString()}`}
          accent="gold"
        />
        <SummaryCard
          icon={<TrendingUp size={16} className="text-iron-blue" />}
          label={t("currentPlanLabel")}
          value={PLAN_LABELS[stats.plan] ?? stats.plan}
          sub={stats.limit > 0 ? `${usagePct}${t("consumed")}` : t("unlimited")}
          accent="blue"
        />
        <SummaryCard
          icon={<Calendar size={16} className="text-iron-white/50" />}
          label={t("resetsIn")}
          value={daysLeft === 1 ? t("day_one", { count: daysLeft }) : t("day_other", { count: daysLeft })}
          sub={monthLabel}
          accent="default"
        />
      </div>

      {/* Usage bar */}
      {stats.limit > 0 && (
        <div className="rounded-2xl bg-iron-slate border border-iron-border p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-iron-white">{t("resetsIn").replace("Resets in", "Monthly quota")}</span>
            <span className="font-mono text-iron-white/60">
              {stats.used.toLocaleString()} / {stats.limit.toLocaleString()}
            </span>
          </div>
          <div className="h-3 bg-iron-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${usagePct}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="text-xs text-iron-white/40">{signaturesLeftText}</p>
        </div>
      )}

      {/* Daily chart */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border p-5">
        <h2 className="text-sm font-semibold text-iron-white mb-5">
          {t("dailyChart")} {monthLabel}
        </h2>

        {stats.daily.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-iron-white/30 text-sm">
            {t("noCertsThisMonth")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#FAFAFA40", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#FAFAFA40", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D4AF3740" }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#D4AF37"
                strokeWidth={2}
                fill="url(#goldGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#D4AF37", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Upgrade CTA if > 70% */}
      {usagePct > 70 && stats.plan !== "enterprise" && (
        <div className="rounded-2xl bg-iron-gold/5 border border-iron-gold/20 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-iron-white">
              {usagePct > 90 ? t("approachingLimit") : t("considerUpgrade")}
            </p>
            <p className="text-xs text-iron-white/50 mt-0.5">{t("upgradeDesc")}</p>
          </div>
          <a
            href="/billing"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
          >
            {t("upgrade")}
          </a>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "gold" | "blue" | "default";
}) {
  const ring =
    accent === "gold"
      ? "ring-iron-gold/20"
      : accent === "blue"
      ? "ring-iron-blue/20"
      : "ring-iron-border";

  return (
    <div className={cn("rounded-2xl bg-iron-slate border border-iron-border p-4 ring-1", ring)}>
      <div className="flex items-center gap-2 mb-3 text-iron-white/50 text-xs">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold text-iron-white tabular-nums">{value}</p>
      <p className="text-xs text-iron-white/40 mt-0.5">{sub}</p>
    </div>
  );
}
