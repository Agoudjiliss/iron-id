"use client";

import { useEffect, useState } from "react";
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
  date: string;    // "2026-04-01"
  count: number;
}

interface UsageStats {
  used: number;
  limit: number;
  plan: string;
  daily: DailyUsage[];
}

// Generate realistic-looking demo data for the current month
function generateDemoData(): DailyUsage[] {
  const days: DailyUsage[] = [];
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  for (let d = 1; d <= Math.min(now.getDate(), daysInMonth); d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    days.push({
      date: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      count: Math.floor(Math.random() * 15),
    });
  }
  return days;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  payg: "Pay-as-you-go",
  individual: "Individual",
  studio: "Studio",
  enterprise: "Enterprise",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="text-iron-white/60 mb-1">{label}</p>
      <p className="text-iron-gold font-bold">{payload[0].value} signature{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

export function UsageClient() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call — in production: fetch /v1/usage with the API key
    setTimeout(() => {
      setStats({
        used: 47,
        limit: 10000,
        plan: "individual",
        daily: generateDemoData(),
      });
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-iron-white/40 text-sm">
        <Loader2 size={16} className="animate-spin" />
        Chargement…
      </div>
    );
  }

  if (!stats) return null;

  const usagePct = stats.limit > 0
    ? Math.min(100, Math.round((stats.used / stats.limit) * 100))
    : 0;

  const barColor =
    usagePct > 90 ? "#FF4757" :
    usagePct > 70 ? "#D4AF37" :
    "#00D26A";

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = lastDay - today.getDate();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Zap size={16} className="text-iron-gold" />}
          label="Signatures utilisées"
          value={stats.used.toLocaleString("fr-FR")}
          sub={`sur ${stats.limit === -1 ? "∞" : stats.limit.toLocaleString("fr-FR")}`}
          accent="gold"
        />
        <SummaryCard
          icon={<TrendingUp size={16} className="text-iron-blue" />}
          label="Plan actuel"
          value={PLAN_LABELS[stats.plan] ?? stats.plan}
          sub={usagePct > 0 ? `${usagePct}% consommé` : "Illimité"}
          accent="blue"
        />
        <SummaryCard
          icon={<Calendar size={16} className="text-iron-white/50" />}
          label="Remise à zéro dans"
          value={`${daysLeft} jour${daysLeft !== 1 ? "s" : ""}`}
          sub={`${today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`}
          accent="default"
        />
      </div>

      {/* Usage bar */}
      {stats.limit > 0 && (
        <div className="rounded-2xl bg-iron-slate border border-iron-border p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-iron-white">Quota mensuel</span>
            <span className="font-mono text-iron-white/60">
              {stats.used.toLocaleString("fr-FR")} / {stats.limit.toLocaleString("fr-FR")}
            </span>
          </div>
          <div className="h-3 bg-iron-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${usagePct}%`, backgroundColor: barColor }}
            />
          </div>
          <p className="text-xs text-iron-white/40">
            {stats.limit - stats.used > 0
              ? `${(stats.limit - stats.used).toLocaleString("fr-FR")} signatures restantes ce mois-ci`
              : "Quota mensuel atteint — passez à un plan supérieur"}
          </p>
        </div>
      )}

      {/* Daily chart */}
      <div className="rounded-2xl bg-iron-slate border border-iron-border p-5">
        <h2 className="text-sm font-semibold text-iron-white mb-5">
          Signatures par jour — {today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </h2>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.3} />
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
      </div>

      {/* Upgrade CTA if > 70% */}
      {usagePct > 70 && stats.plan !== "enterprise" && (
        <div className="rounded-2xl bg-iron-gold/5 border border-iron-gold/20 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-iron-white">
              {usagePct > 90 ? "Vous approchez de votre limite !" : "Pensez à mettre à niveau"}
            </p>
            <p className="text-xs text-iron-white/50 mt-0.5">
              Passez à un plan supérieur pour ne jamais être bloqué.
            </p>
          </div>
          <a
            href="/billing"
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium bg-iron-gold text-iron-black hover:bg-iron-gold-dim transition-colors"
          >
            Mettre à niveau →
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
    accent === "gold" ? "ring-iron-gold/20" :
    accent === "blue" ? "ring-iron-blue/20" :
    "ring-iron-border";

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
