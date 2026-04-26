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

const INDUSTRIES = [
  { label: "Media & Journalism",             Icon: Newspaper    },
  { label: "Generative AI Platforms",        Icon: Sparkles     },
  { label: "Government & Public Institutions",Icon: Building2   },
  { label: "Legal & Digital Evidence",        Icon: Scale       },
  { label: "Social Media Platforms",          Icon: Share2      },
  { label: "Content Creators & Digital Artists",Icon: Palette   },
  { label: "Brands & Marketing Agencies",     Icon: Megaphone   },
  { label: "Camera Manufacturers",            Icon: Camera      },
  { label: "Mobile Apps & Developer Platforms",Icon: Smartphone },
  { label: "Security & Digital Forensics",    Icon: ShieldCheck },
  { label: "E-commerce Platforms",            Icon: ShoppingBag },
  { label: "Education & Research",            Icon: GraduationCap},
  { label: "Insurance Companies",             Icon: HeartPulse  },
  { label: "Law Enforcement",                 Icon: Siren       },
  { label: "Film & Video Production",         Icon: Film        },
  { label: "Music & Audio Production",        Icon: Music       },
  { label: "Advertising & Media Agencies",    Icon: Tv2         },
  { label: "Healthcare & Medical Imaging",    Icon: Stethoscope },
  { label: "Archival & Digital Preservation", Icon: Archive     },
  { label: "Cybersecurity Platforms",         Icon: Lock        },
];

// Split into two rows, interleaved for visual balance
const ROW_A = INDUSTRIES.filter((_, i) => i % 2 === 0); // 10 items
const ROW_B = INDUSTRIES.filter((_, i) => i % 2 === 1); // 10 items

function Pill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-iron-border bg-iron-slate text-iron-white/70 text-sm font-medium whitespace-nowrap hover:border-iron-gold/40 hover:text-iron-white transition-colors duration-200 flex-shrink-0">
      <Icon size={13} className="text-iron-gold/70 flex-shrink-0" />
      {label}
    </span>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: typeof INDUSTRIES;
  reverse?: boolean;
}) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex gap-3 w-max ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {doubled.map(({ label, Icon }, i) => (
          <Pill key={`${label}-${i}`} label={label} Icon={Icon} />
        ))}
      </div>
    </div>
  );
}

export function Industries() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center mb-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-iron-gold uppercase mb-3">
          Secteurs d'application
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-iron-white leading-tight">
          La provenance numérique pour{" "}
          <span className="text-gradient-gold">tous les secteurs</span>
        </h2>
        <p className="mt-4 text-iron-white/50 max-w-xl mx-auto text-base">
          De la presse aux soins de santé, IronID certifie l'authenticité de
          vos fichiers quel que soit votre domaine.
        </p>
      </div>

      <div className="space-y-3">
        <MarqueeRow items={ROW_A} />
        <MarqueeRow items={ROW_B} reverse />
      </div>
    </section>
  );
}
