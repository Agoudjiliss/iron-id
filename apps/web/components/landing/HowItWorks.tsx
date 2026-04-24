import { Upload, Cpu, Globe } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Uploadez votre fichier",
    description:
      "Envoyez n'importe quel fichier via notre API REST ou nos SDK JS/Python. Nous acceptons images, vidéos, PDF et audio jusqu'à 100 Mo.",
    detail: "POST /v1/certify",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Signature C2PA & Ledger",
    description:
      "IronID calcule le SHA-256, construit un manifest C2PA, signe avec ECDSA P-256 et inscrit le tout dans un ledger PostgreSQL immuable protégé par Row-Level Security.",
    detail: "Asynchrone — webhook ou polling",
  },
  {
    icon: Globe,
    step: "03",
    title: "Vérification publique",
    description:
      "N'importe qui peut vérifier l'authenticité d'un fichier via l'URL publique ou en uploadant le fichier directement — aucun compte requis.",
    detail: "GET /v1/verify/{hash}",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-iron-gold uppercase tracking-widest mb-3">
            Comment ça marche
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-iron-white">
            Trois étapes. Immuable pour toujours.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-iron-gold/20 via-iron-gold/40 to-iron-gold/20"
          />

          {STEPS.map(({ icon: Icon, step, title, description, detail }) => (
            <div key={step} className="relative group">
              <div className="bg-iron-slate border border-iron-border rounded-2xl p-6 h-full transition-all duration-300 hover:border-iron-gold/30 hover:shadow-lg hover:shadow-iron-gold/5">
                {/* Step number */}
                <span className="text-xs font-bold text-iron-gold/30 mono">{step}</span>

                {/* Icon */}
                <div className="mt-3 mb-4 w-10 h-10 rounded-xl bg-iron-gold/10 flex items-center justify-center group-hover:bg-iron-gold/15 transition-colors">
                  <Icon size={18} className="text-iron-gold" />
                </div>

                <h3 className="text-base font-semibold text-iron-white mb-2">{title}</h3>
                <p className="text-sm text-iron-white/40 leading-relaxed mb-4">{description}</p>

                <div className="px-2.5 py-1 rounded-lg bg-iron-black/60 border border-iron-border inline-block">
                  <span className="text-xs font-mono text-iron-white/30">{detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
