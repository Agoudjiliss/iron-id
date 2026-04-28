import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NavServer } from "@/components/landing/NavServer";
import { Footer }    from "@/components/landing/Footer";
import { PricingClient } from "@/components/billing/PricingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs — IronID",
  description:
    "Plans IronID : Individual à $29/mois, Studio à $199/mois, Enterprise à $1 200/mois. Certification C2PA illimitée. Paiement PayPal sécurisé.",
  alternates: { canonical: "https://www.iron-id.io/pricing" },
  openGraph: {
    title:       "Tarifs IronID — Certification C2PA pour tous",
    description: "Individual $29/mois · Studio $199/mois · Enterprise $1 200/mois. Commencez gratuitement, aucune carte bancaire requise.",
    url:         "https://www.iron-id.io/pricing",
    type:        "website",
  },
};

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const faqItems = (["0", "1", "2", "3"] as const).map((i) => ({
    q: t(`faq.${i}.q`),
    a: t(`faq.${i}.a`),
  }));

  return (
    <>
      <NavServer />
      <main className="min-h-screen bg-iron-black px-4 pt-28 pb-16">
        {/* Background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-iron-gold/4 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-iron-white mb-4">
              {t("headline1")}{" "}
              <span className="text-gradient-gold">{t("headline2")}</span>
            </h1>
            <p className="text-lg text-iron-white/50 max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <PricingClient />

          {/* FAQ */}
          <div className="mt-16 max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold text-iron-white text-center mb-6">
              {t("faqTitle")}
            </h2>
            {faqItems.map(({ q, a }) => (
              <details
                key={q}
                className="rounded-2xl bg-iron-slate border border-iron-border overflow-hidden group"
              >
                <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-iron-white/80 hover:text-iron-white list-none flex items-center justify-between select-none">
                  {q}
                  <span className="text-iron-white/30 group-open:rotate-180 transition-transform text-lg leading-none">
                    ⌄
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-iron-white/50">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
