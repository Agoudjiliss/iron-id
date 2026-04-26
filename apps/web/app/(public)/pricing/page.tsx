import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { PricingClient } from "@/components/billing/PricingClient";

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

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-iron-black px-4 py-16">
      {/* Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-iron-gold/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <a href="/" className="inline-flex items-center gap-2 group">
            <Shield size={28} className="text-iron-gold" />
            <span className="text-xl font-bold text-iron-white">
              Iron<span className="text-gradient-gold">ID</span>
            </span>
          </a>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-iron-white mb-4">
            Certifiez. Prouvez.{" "}
            <span className="text-gradient-gold">Protégez.</span>
          </h1>
          <p className="text-lg text-iron-white/50 max-w-xl mx-auto">
            Choisissez le plan adapté à vos besoins. Paiement sécurisé via PayPal.
            Annulation à tout moment.
          </p>
        </div>

        <PricingClient />

        {/* FAQ mini */}
        <div className="mt-16 max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-iron-white text-center mb-6">Questions fréquentes</h2>
          {[
            {
              q: "Comment fonctionne le paiement PayPal ?",
              a: "Vous êtes redirigé vers PayPal pour approuver l'abonnement. Une fois confirmé, votre plan est activé immédiatement. Vous recevrez une notification PayPal à chaque renouvellement.",
            },
            {
              q: "Puis-je annuler à tout moment ?",
              a: "Oui. Vous pouvez annuler votre abonnement depuis le tableau de bord ou directement via PayPal. L'accès est maintenu jusqu'à la fin de la période payée.",
            },
            {
              q: "Qu'est-ce que le Pay-as-you-go ?",
              a: "Sans abonnement, vous payez $0.10 par signature via une commande PayPal ponctuelle. Idéal pour les usages occasionnels ou les tests.",
            },
            {
              q: "Vos données sont-elles hébergées en Europe ?",
              a: "Oui. Toutes les données sont hébergées en Europe (Cloudflare EU + Railway Frankfurt) pour la conformité RGPD.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="rounded-2xl bg-iron-slate border border-iron-border overflow-hidden group">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-iron-white/80 hover:text-iron-white list-none flex items-center justify-between select-none">
                {q}
                <span className="text-iron-white/30 group-open:rotate-180 transition-transform text-lg leading-none">⌄</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-iron-white/50">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
