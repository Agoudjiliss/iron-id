import { Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AffiliateWidget } from "@/components/affiliate/AffiliateWidget";
import { CommissionsTable } from "@/components/affiliate/CommissionsTable";

export async function generateMetadata() {
  const t = await getTranslations("affiliate");
  return {
    title: t("pageTitle") + " — IronID",
    description: t("pageDesc"),
  };
}

export default async function AffiliatePage() {
  const t = await getTranslations("affiliate");

  const steps = [
    { step: "01", title: t("step1Title"), desc: t("step1Desc") },
    { step: "02", title: t("step2Title"), desc: t("step2Desc") },
    { step: "03", title: t("step3Title"), desc: t("step3Desc") },
  ];

  const tiers = [
    { name: "Iron",     required: 0,   rate: "10%",  color: "text-iron-white/50" },
    { name: "Bronze",   required: 5,   rate: "12%",  color: "text-amber-400"     },
    { name: "Silver",   required: 15,  rate: "15%",  color: "text-slate-300"     },
    { name: "Gold",     required: 30,  rate: "17%",  color: "text-iron-gold"     },
    { name: "Platinum", required: 50,  rate: "20%",  color: "text-purple-400"    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-iron-gold/10 flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-iron-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-iron-white">{t("pageTitle")}</h1>
          <p className="mt-1 text-sm text-iron-white/40">{t("pageDesc")}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map(({ step, title, desc }) => (
          <div key={step} className="bg-iron-slate border border-iron-border rounded-2xl p-4">
            <span className="text-xs font-bold text-iron-gold/40 mono">{step}</span>
            <h3 className="mt-1.5 text-sm font-semibold text-iron-white">{title}</h3>
            <p className="mt-1 text-xs text-iron-white/40 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Tier table */}
      <div className="bg-iron-slate border border-iron-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-iron-border">
          <h2 className="text-sm font-semibold text-iron-white">{t("tiers")}</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-iron-white/30 border-b border-iron-border/50">
              <th className="text-left px-5 py-3 font-medium">{t("tierLevel")}</th>
              <th className="text-right px-5 py-3 font-medium">{t("tierRequired")}</th>
              <th className="text-right px-5 py-3 font-medium">{t("tierCommission")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-border/30">
            {tiers.map((tier) => (
              <tr key={tier.name} className="hover:bg-iron-border/10 transition-colors">
                <td className={`px-5 py-3 font-semibold ${tier.color}`}>{tier.name}</td>
                <td className="px-5 py-3 text-right text-iron-white/50">
                  {tier.required === 0 ? t("tierFromSignup") : `${tier.required}+`}
                </td>
                <td className="px-5 py-3 text-right font-bold text-iron-gold">{tier.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live widget */}
      <AffiliateWidget />

      {/* Commissions history */}
      <CommissionsTable />
    </div>
  );
}
