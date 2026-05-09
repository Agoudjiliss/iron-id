"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  { key: "individual", label: "Individual", price: 29 },
  { key: "studio",     label: "Studio",     price: 199 },
];

const TIERS: { min: number; max: number | null; rate: number; name: string; color: string }[] = [
  { min: 0,  max: 5,    rate: 0.10, name: "Iron",     color: "text-iron-white/60" },
  { min: 6,  max: 20,   rate: 0.12, name: "Silver",   color: "text-slate-300"    },
  { min: 21, max: 49,   rate: 0.15, name: "Gold",     color: "text-iron-gold"    },
  { min: 50, max: null, rate: 0.20, name: "Platinum", color: "text-purple-400"   },
];

function getTier(referrals: number) {
  return TIERS.find(
    (t) => referrals >= t.min && (t.max === null || referrals <= t.max),
  )!;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AffiliateCalculator() {
  const [referrals, setReferrals] = useState(10);
  const [planKey,   setPlanKey]   = useState("individual");

  const plan   = PLANS.find((p) => p.key === planKey)!;
  const tier   = getTier(referrals);
  const monthly = plan.price * tier.rate * referrals;
  const yearly  = monthly * 12;

  const nextTier = TIERS.find((t) => t.min > referrals);
  const pctToNext = nextTier
    ? Math.min(100, Math.round((referrals / nextTier.min) * 100))
    : 100;

  return (
    <div className="rounded-2xl bg-iron-slate border border-iron-border overflow-hidden">
      {/* Controls */}
      <div className="p-6 space-y-6">
        {/* Plan selector */}
        <div>
          <label className="text-xs text-iron-white/40 font-medium uppercase tracking-wider mb-2 block">
            Plan souscrit par vos filleuls
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPlanKey(p.key)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-semibold border transition-all",
                  planKey === p.key
                    ? "bg-iron-gold text-iron-black border-iron-gold"
                    : "bg-iron-black border-iron-border text-iron-white/60 hover:text-iron-white hover:border-iron-gold/30",
                )}
              >
                {p.label}
                <span className="block text-xs font-normal mt-0.5 opacity-70">
                  ${p.price}/mois
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Referrals slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-iron-white/40 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Users size={11} /> Nombre de filleuls actifs
            </label>
            <span className="text-2xl font-black text-iron-white tabular-nums">
              {referrals}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={100}
            value={referrals}
            onChange={(e) => setReferrals(Number(e.target.value))}
            className="w-full h-2 rounded-full accent-iron-gold cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4AF37 ${referrals}%, #2A2A3E ${referrals}%)`,
            }}
          />

          <div className="flex justify-between text-xs text-iron-white/20 mt-1">
            <span>1</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Tier badge + progress */}
      <div className="px-6 pb-4">
        <div className="rounded-xl bg-iron-black/50 border border-iron-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-iron-white/40">Votre niveau actuel</span>
            <span className={cn("text-sm font-bold", tier.color)}>{tier.name} — {Math.round(tier.rate * 100)}%</span>
          </div>

          {nextTier ? (
            <>
              <div className="h-1.5 bg-iron-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-iron-gold rounded-full transition-all duration-300"
                  style={{ width: `${pctToNext}%` }}
                />
              </div>
              <p className="text-xs text-iron-white/25 mt-1.5">
                {nextTier.min - referrals} filleul{nextTier.min - referrals > 1 ? "s" : ""} de plus pour atteindre {TIERS.find(t => t.min === nextTier.min)?.name} ({Math.round(nextTier.rate * 100)}%)
              </p>
            </>
          ) : (
            <p className="text-xs text-purple-400/60 mt-1">
              Niveau maximum atteint — 20% de commission.
            </p>
          )}
        </div>
      </div>

      {/* Result */}
      <div className="border-t border-iron-border bg-iron-gold/5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-iron-white/40 mb-1">
              <DollarSign size={11} /> Revenus mensuels
            </div>
            <p className="text-4xl font-black text-iron-gold tabular-nums">
              ${fmt(monthly)}
            </p>
            <p className="text-xs text-iron-white/30 mt-1">
              {Math.round(tier.rate * 100)}% × ${plan.price} × {referrals} filleuls
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-iron-white/40 mb-1">
              <TrendingUp size={11} /> Revenus annuels
            </div>
            <p className="text-4xl font-black text-iron-white tabular-nums">
              ${fmt(yearly)}
            </p>
            <p className="text-xs text-iron-white/30 mt-1">si tous restent abonnés</p>
          </div>
        </div>

        <a
          href="/sign-up"
          className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold bg-iron-gold text-iron-black hover:bg-iron-gold/90 transition-colors"
        >
          Obtenir mon lien affilié →
        </a>
      </div>
    </div>
  );
}
