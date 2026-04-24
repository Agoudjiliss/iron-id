import {
  Shield,
  Lock,
  Zap,
  Globe,
  Code2,
  BarChart2,
  RefreshCw,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Signature C2PA",
    desc: "Standard ouvert Coalition for Content Provenance and Authenticity. Interopérable avec Adobe, Microsoft, Google.",
  },
  {
    icon: Lock,
    title: "Ledger immuable",
    desc: "PostgreSQL avec Row-Level Security — UPDATE et DELETE bloqués au niveau base de données. Pas de rollback possible.",
  },
  {
    icon: Zap,
    title: "Traitement asynchrone",
    desc: "Certification via Celery + Redis. Retours webhook ou polling. Aucun timeout HTTP côté client.",
  },
  {
    icon: Code2,
    title: "SDK officiel",
    desc: "SDK JavaScript/TypeScript et Python avec types stricts, gestion d'erreurs et retry automatique.",
  },
  {
    icon: Globe,
    title: "Vérification publique",
    desc: "URL de vérification partageable. N'importe qui peut prouver ou réfuter l'authenticité d'un fichier.",
  },
  {
    icon: BarChart2,
    title: "Dashboard complet",
    desc: "Vue d'ensemble, graphique de consommation, historique des certifications, gestion des clés API.",
  },
  {
    icon: RefreshCw,
    title: "Billing Pay-as-you-go",
    desc: "Payez uniquement ce que vous utilisez. Abonnements mensuels ou PAYG via PayPal.",
  },
  {
    icon: Users,
    title: "Programme d'affiliation",
    desc: "Parrainez des utilisateurs, gagnez jusqu'à 20% de commission récurrente. Paiement PayPal automatique.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-iron-slate/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-iron-gold uppercase tracking-widest mb-3">
            Fonctionnalités
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-iron-white">
            Tout ce qu'il faut pour
            <br />
            l'authenticité à l'échelle.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-iron-slate border border-iron-border rounded-2xl p-5 hover:border-iron-gold/20 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-iron-gold/10 flex items-center justify-center mb-4 group-hover:bg-iron-gold/15 transition-colors">
                <Icon size={16} className="text-iron-gold" />
              </div>
              <h3 className="text-sm font-semibold text-iron-white mb-2">{title}</h3>
              <p className="text-xs text-iron-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
