import {
  Newspaper,
  Sparkles,
  Building2,
  Scale,
  Share2,
  Palette,
  Megaphone,
  Camera,
  Smartphone,
  ShieldCheck,
  ShoppingBag,
  GraduationCap,
  HeartPulse,
  Siren,
  Film,
  Music,
  Tv2,
  Stethoscope,
  Archive,
  Lock,
} from "lucide-react";

// ─── All 20 industries (for marquee) ─────────────────────────────────────────
const INDUSTRIES = [
  { label: "Media & Journalism",               Icon: Newspaper     },
  { label: "Generative AI Platforms",          Icon: Sparkles      },
  { label: "Government & Public Institutions", Icon: Building2     },
  { label: "Legal & Digital Evidence",         Icon: Scale         },
  { label: "Social Media Platforms",           Icon: Share2        },
  { label: "Content Creators & Digital Artists", Icon: Palette     },
  { label: "Brands & Marketing Agencies",      Icon: Megaphone     },
  { label: "Camera Manufacturers",             Icon: Camera        },
  { label: "Mobile Apps & Developer Platforms",Icon: Smartphone    },
  { label: "Security & Digital Forensics",     Icon: ShieldCheck   },
  { label: "E-commerce Platforms",             Icon: ShoppingBag   },
  { label: "Education & Research",             Icon: GraduationCap },
  { label: "Insurance Companies",              Icon: HeartPulse    },
  { label: "Law Enforcement",                  Icon: Siren         },
  { label: "Film & Video Production",          Icon: Film          },
  { label: "Music & Audio Production",         Icon: Music         },
  { label: "Advertising & Media Agencies",     Icon: Tv2           },
  { label: "Healthcare & Medical Imaging",     Icon: Stethoscope   },
  { label: "Archival & Digital Preservation",  Icon: Archive       },
  { label: "Cybersecurity Platforms",          Icon: Lock          },
];

// ─── Featured sectors with marketing copy ────────────────────────────────────
const FEATURED = [
  {
    Icon: Newspaper,
    sector: "Presse & Journalisme",
    stat: "86%",
    statLabel: "du public méfiant des photos d'actualité",
    value: "Chaque image publiée prouve son origine. Fin des accusations de manipulation.",
    accent: "border-amber-500/25 bg-amber-500/5",
    statColor: "text-amber-400",
  },
  {
    Icon: Sparkles,
    sector: "IA Générative",
    stat: "100%",
    statLabel: "des contenus IA traçables",
    value: "Déclarez la provenance IA dès la création. Conformité EU AI Act incluse.",
    accent: "border-violet-500/25 bg-violet-500/5",
    statColor: "text-violet-400",
  },
  {
    Icon: Scale,
    sector: "Droit & Justice",
    stat: "J+0",
    statLabel: "intégrité certifiée à la capture",
    value: "Preuves numériques infalsifiables admissibles devant les tribunaux.",
    accent: "border-sky-500/25 bg-sky-500/5",
    statColor: "text-sky-400",
  },
  {
    Icon: HeartPulse,
    sector: "Santé & Imagerie médicale",
    stat: "ISO",
    statLabel: "compatible DICOM & HL7",
    value: "Intégrité des images médicales, résultats de labo et dossiers patients.",
    accent: "border-emerald-500/25 bg-emerald-500/5",
    statColor: "text-emerald-400",
  },
  {
    Icon: Building2,
    sector: "Gouvernements",
    stat: "190+",
    statLabel: "pays concernés par la réglementation",
    value: "Documents officiels, archives nationales et communications gouvernementales certifiés.",
    accent: "border-iron-gold/25 bg-iron-gold/5",
    statColor: "text-iron-gold",
  },
  {
    Icon: Film,
    sector: "Film & Production vidéo",
    stat: "$13B",
    statLabel: "perdus/an à cause du piratage",
    value: "Protégez vos rushes, maîtrisez la chaîne de distribution, prouvez l'original.",
    accent: "border-rose-500/25 bg-rose-500/5",
    statColor: "text-rose-400",
  },
];

const ROW_A = INDUSTRIES.filter((_, i) => i % 2 === 0);
const ROW_B = INDUSTRIES.filter((_, i) => i % 2 === 1);

function Pill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-iron-border bg-iron-slate text-iron-white/60 text-sm font-medium whitespace-nowrap hover:border-iron-gold/30 hover:text-iron-white transition-colors duration-200 flex-shrink-0">
      <Icon size={12} className="text-iron-gold/60 flex-shrink-0" />
      {label}
    </span>
  );
}

function MarqueeRow({ items, reverse = false }: { items: typeof INDUSTRIES; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <div className={`flex gap-3 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {doubled.map(({ label, Icon }, i) => (
          <Pill key={`${label}-${i}`} label={label} Icon={Icon} />
        ))}
      </div>
    </div>
  );
}

export function Industries() {
  return (
    <section className="py-24 overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 text-center mb-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-iron-gold uppercase mb-3">
          Secteurs d'application
        </p>
        <h2 className="text-3xl md:text-5xl font-black text-iron-white leading-tight mb-4">
          La crise de l'authenticité numérique
          <br />
          <span className="text-gradient-gold">touche chaque secteur.</span>
        </h2>
        <p className="text-iron-white/40 max-w-2xl mx-auto text-lg">
          Deepfakes, contenus IA, documents falsifiés — IronID protège les organisations
          qui ne peuvent pas se permettre de douter de leurs fichiers.
        </p>
      </div>

      {/* Featured sectors grid */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED.map(({ Icon, sector, stat, statLabel, value, accent, statColor }) => (
            <div
              key={sector}
              className={`rounded-2xl border p-6 hover:scale-[1.01] transition-transform duration-200 ${accent}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-iron-black/40 border border-iron-border/50 flex items-center justify-center">
                  <Icon size={17} className={statColor} />
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black tabular-nums ${statColor}`}>{stat}</p>
                  <p className="text-[10px] text-iron-white/30 max-w-[110px] leading-tight">{statLabel}</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-iron-white mb-1.5">{sector}</h3>
              <p className="text-sm text-iron-white/45 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All-sectors marquee */}
      <div className="space-y-3">
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </div>

      <p className="text-center text-xs text-iron-white/20 mt-6 px-6">
        20 secteurs couverts · Norme C2PA · Vérification publique
      </p>
    </section>
  );
}
