const STATS = [
  { value: "C2PA",     label: "Standard ouvert"           },
  { value: "<200ms",   label: "Latence vérification"      },
  { value: "100Mo",    label: "Taille max par fichier"     },
  { value: "99.9%",    label: "SLA de disponibilité"      },
];

const TESTIMONIALS = [
  {
    quote: "IronID nous a permis de prouver l'authenticité de nos photos de presse en quelques secondes. Un game-changer pour la confiance de nos lecteurs.",
    name: "Marie L.",
    role: "Responsable photo, Agence de presse",
  },
  {
    quote: "L'intégration via SDK a pris 20 minutes. On certifie maintenant automatiquement chaque export de notre pipeline créatif.",
    name: "Théo M.",
    role: "Lead developer, Studio vidéo",
  },
  {
    quote: "La vérification publique sans compte est ce qui nous a convaincus. Nos clients peuvent prouver l'authenticité eux-mêmes.",
    name: "Anis B.",
    role: "CTO, Startup LegalTech",
  },
];

export function SocialProof() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-iron-slate border border-iron-border rounded-2xl p-6 text-center"
            >
              <p className="text-2xl md:text-3xl font-extrabold text-gradient-gold mb-1">{value}</p>
              <p className="text-xs text-iron-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-iron-gold uppercase tracking-widest mb-3">
            Témoignages
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-iron-white">
            Ils font confiance à IronID
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div
              key={name}
              className="bg-iron-slate border border-iron-border rounded-2xl p-6 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#D4AF37">
                    <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.895l-3.09 1.615.59-3.44L2 4.635l3.455-.505z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-iron-white/60 leading-relaxed flex-1">"{quote}"</p>

              <div>
                <p className="text-sm font-semibold text-iron-white">{name}</p>
                <p className="text-xs text-iron-white/30">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
