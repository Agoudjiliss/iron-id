"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PricingCard } from "./PricingCard";
import { cn } from "@/lib/utils";

export function PricingClient({ currentPlan = "free" }: { currentPlan?: string }) {
  const { getToken } = useAuth();
  const t = useTranslations("pricing");
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const PLANS_MONTHLY = [
    {
      planKey: "payg",
      label: "Pay-as-you-go",
      interval: "monthly" as const,
      priceLabel: "$0.10 / sig.",
      priceUsd: 0.10,
      yearlySave: null,
      signatures: -1,
      features: t.raw("paygFeatures") as string[],
      isPopular: false,
    },
    {
      planKey: "individual_monthly",
      label: "Individual",
      interval: "monthly" as const,
      priceLabel: "$29 / mo",
      priceUsd: 29,
      yearlySave: null,
      signatures: 10_000,
      features: t.raw("individualFeatures") as string[],
      isPopular: true,
    },
    {
      planKey: "studio_monthly",
      label: "Studio",
      interval: "monthly" as const,
      priceLabel: "$199 / mo",
      priceUsd: 199,
      yearlySave: null,
      signatures: 100_000,
      features: t.raw("studioFeatures") as string[],
      isPopular: false,
    },
    {
      planKey: "enterprise_monthly",
      label: "Enterprise",
      interval: "monthly" as const,
      priceLabel: "$1,200 / mo",
      priceUsd: 1200,
      yearlySave: null,
      signatures: -1,
      features: t.raw("enterpriseFeatures") as string[],
      isPopular: false,
    },
  ];

  const PLANS_YEARLY = [
    { ...PLANS_MONTHLY[0] },
    {
      ...PLANS_MONTHLY[1],
      planKey: "individual_yearly",
      priceLabel: "$232 / yr",
      priceUsd: 232,
      yearlySave: t("save20"),
    },
    {
      ...PLANS_MONTHLY[2],
      planKey: "studio_yearly",
      priceLabel: "$1,908 / yr",
      priceUsd: 1908,
      yearlySave: t("save20"),
    },
    {
      ...PLANS_MONTHLY[3],
      planKey: "enterprise_yearly",
      priceLabel: "$11,520 / yr",
      priceUsd: 11520,
      yearlySave: t("save20"),
    },
  ];

  const plans = interval === "monthly" ? PLANS_MONTHLY : PLANS_YEARLY;

  async function handleSelect(planKey: string) {
    if (planKey === "payg") {
      router.push("/dashboard");
      return;
    }
    if (planKey.startsWith("enterprise")) {
      window.location.href = "mailto:sales@ironid.io?subject=Enterprise Plan";
      return;
    }

    const token = await getToken();
    if (!token) { alert(t("sessionExpired")); return; }

    setLoading(planKey);
    try {
      const res = await fetch("/api/v1/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan_key: planKey,
          return_url: `${window.location.origin}/billing?success=1`,
          cancel_url: `${window.location.origin}/billing?cancelled=1`,
        }),
      });

      if (!res.ok) throw new Error(t("subscribeError"));
      const data = await res.json();

      if (data.approval_url) {
        window.location.href = data.approval_url;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t("subscribeError"));
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Interval toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-iron-slate border border-iron-border">
          {(["monthly", "yearly"] as const).map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                interval === iv
                  ? "bg-iron-gold text-iron-black shadow-sm"
                  : "text-iron-white/50 hover:text-iron-white",
              )}
            >
              {iv === "monthly" ? t("monthly") : t("yearly")}
              {iv === "yearly" && (
                <span className="ml-1.5 text-xs font-semibold text-iron-green">−20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {plans.map((plan) => (
          <PricingCard
            key={plan.planKey}
            {...plan}
            isCurrentPlan={currentPlan === plan.planKey.split("_")[0]}
            onSelect={handleSelect}
            loading={loading === plan.planKey}
          />
        ))}
      </div>

      {/* PayPal trust badge */}
      <div className="flex items-center justify-center gap-3 text-xs text-iron-white/30">
        <span>{t("paypalTrust")}</span>
        <span className="font-bold text-[#003087] bg-white px-2 py-0.5 rounded text-xs">PayPal</span>
        <span>· {t("paypalSuffix")}</span>
      </div>
    </div>
  );
}
