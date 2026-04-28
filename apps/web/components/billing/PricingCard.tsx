"use client";

import { Check, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  planKey: string;
  label: string;
  interval: "monthly" | "yearly";
  priceLabel: string;
  priceUsd: number;
  yearlySave?: string | null;
  signatures: number;
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: (planKey: string) => void;
  loading?: boolean;
}

export function PricingCard({
  planKey,
  label,
  interval,
  priceLabel,
  priceUsd,
  yearlySave,
  signatures,
  features,
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  loading = false,
}: PricingCardProps) {
  const t = useTranslations("pricing");
  const isEnterprise = planKey.startsWith("enterprise");
  const isPayg       = planKey === "payg";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all duration-200",
        isPopular
          ? "border-iron-gold/50 bg-iron-slate ring-1 ring-iron-gold/20 scale-[1.02]"
          : "border-iron-border bg-iron-slate hover:border-iron-gold/25",
        isCurrentPlan && "border-iron-green/40 ring-1 ring-iron-green/20",
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-iron-gold text-iron-black">
            {t("popularBadge")}
          </span>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-iron-green/20 text-iron-green ring-1 ring-iron-green/30">
            {t("currentPlanBadge")}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-iron-white">{label}</h3>
          {yearlySave && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-iron-green/15 text-iron-green">
              {yearlySave}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-iron-white">{priceLabel}</span>
        </div>

        <p className="text-xs text-iron-white/40 mt-1">
          {isPayg ? t("noCommitment") :
           interval === "yearly" ? t("billedYearly") :
           t("billedMonthly")}
        </p>
      </div>

      {/* Signatures */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-iron-black/40 border border-iron-border">
        <Zap size={14} className="text-iron-gold flex-shrink-0" />
        <span className="text-sm font-medium text-iron-white">
          {signatures === -1
            ? t("unlimited")
            : `${signatures.toLocaleString()} ${t("sigsMonth")}`}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-6 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-iron-white/70">
            <Check size={14} className="text-iron-green flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="py-2.5 rounded-xl text-center text-sm font-medium text-iron-green bg-iron-green/10 border border-iron-green/20">
          {t("currentPlanCta")}
        </div>
      ) : (
        <button
          onClick={() => onSelect(planKey)}
          disabled={loading}
          className={cn(
            "py-2.5 rounded-xl text-sm font-semibold transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isEnterprise
              ? "bg-iron-white text-iron-black hover:bg-iron-white/90"
              : isPopular
              ? "bg-iron-gold text-iron-black hover:bg-iron-gold-dim"
              : "bg-iron-border text-iron-white hover:bg-iron-border/80 border border-iron-border hover:border-iron-gold/30",
          )}
        >
          {loading ? t("redirecting") :
           isPayg ? t("payPerUse") :
           isEnterprise ? t("contactTeam") :
           t("subscribe")}
        </button>
      )}

      {/* PayPal notice */}
      {!isCurrentPlan && !isPayg && (
        <p className="text-center text-xs text-iron-white/25 mt-2">
          {t("securePaypal")}
        </p>
      )}
    </div>
  );
}
