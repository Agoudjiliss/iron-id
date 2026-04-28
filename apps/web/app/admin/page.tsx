"use client";

import { useEffect, useState } from "react";
import { useAdminKey, adminFetch } from "./_components";
import { PageShell, Spinner } from "./_components";
import { Users, FileCheck, Zap, TrendingUp, Shield } from "lucide-react";

interface Stats {
  users: { total: number; today: number; this_week: number };
  certifications: { total: number; today: number; this_week: number; this_month: number };
  plans: Record<string, number>;
  active_trials: number;
}

const PLAN_COLORS: Record<string, string> = {
  free:       "bg-iron-border/50 text-iron-white/50",
  payg:       "bg-blue-500/20 text-blue-400",
  individual: "bg-iron-gold/20 text-iron-gold",
  studio:     "bg-purple-500/20 text-purple-400",
  enterprise: "bg-green-500/20 text-green-400",
};

export default function AdminOverview() {
  const key = useAdminKey();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/v1/admin/stats", key)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, [key]);

  if (loading) return <PageShell title="Overview"><Spinner /></PageShell>;
  if (error)   return <PageShell title="Overview"><p className="text-red-400">{error}</p></PageShell>;
  if (!stats)  return null;

  const plans = Object.entries(stats.plans).sort((a, b) => b[1] - a[1]);
  const totalPlanned = plans.reduce((s, [, v]) => s + v, 0);

  return (
    <PageShell title="Overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users}     label="Total users"           value={stats.users.total}                sub={`+${stats.users.today} today · +${stats.users.this_week} this week`} color="gold" />
        <KpiCard icon={FileCheck} label="Total certifications"  value={stats.certifications.total}       sub={`+${stats.certifications.today} today · +${stats.certifications.this_week} this week`} color="green" />
        <KpiCard icon={TrendingUp} label="Certs this month"     value={stats.certifications.this_month}  sub="Last 30 days" color="blue" />
        <KpiCard icon={Zap}       label="Active trials"         value={stats.active_trials}              sub="Enterprise trials running" color="purple" />
      </div>

      <div className="rounded-2xl border border-iron-border bg-iron-slate p-6">
        <h2 className="text-sm font-semibold text-iron-white mb-4 flex items-center gap-2">
          <Shield size={14} className="text-iron-gold" /> Plan distribution
        </h2>
        <div className="space-y-3">
          {plans.map(([plan, count]) => {
            const pct = totalPlanned > 0 ? Math.round((count / totalPlanned) * 100) : 0;
            return (
              <div key={plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[plan] ?? PLAN_COLORS.free}`}>
                    {plan}
                  </span>
                  <span className="text-xs text-iron-white/50">{count} users · {pct}%</span>
                </div>
                <div className="h-1.5 bg-iron-border rounded-full overflow-hidden">
                  <div className="h-full bg-iron-gold/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}

function KpiCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: number; sub: string;
  color: "gold" | "green" | "blue" | "purple";
}) {
  const colors = {
    gold:   "text-iron-gold bg-iron-gold/10",
    green:  "text-green-400 bg-green-400/10",
    blue:   "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };
  return (
    <div className="rounded-2xl border border-iron-border bg-iron-slate p-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={15} />
      </div>
      <p className="text-2xl font-black text-iron-white">{value.toLocaleString()}</p>
      <p className="text-xs font-medium text-iron-white/50 mt-0.5">{label}</p>
      <p className="text-xs text-iron-white/25 mt-1">{sub}</p>
    </div>
  );
}
