import { getTranslations } from "next-intl/server";

const FOUNDER_NAMES = ["Adobe", "Microsoft", "BBC", "Intel", "Arm", "Truepic"];

const ADOPTERS_ROW_A = [
  "Google", "Apple", "OpenAI", "Reuters", "Associated Press",
  "Getty Images", "Shutterstock", "Sony", "Nikon", "Canon",
];
const ADOPTERS_ROW_B = [
  "Leica", "The New York Times", "Washington Post", "Publicis Groupe",
  "Qualcomm", "Nvidia", "Stability AI", "PwC", "Agence France-Presse", "Midjourney",
];

function AdopterPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-4 py-2 rounded-full border border-iron-border/60 bg-iron-black/50 text-iron-white/50 text-sm font-semibold whitespace-nowrap flex-shrink-0 hover:text-iron-white hover:border-iron-border transition-colors duration-200">
      {name}
    </span>
  );
}

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <div className={`flex gap-3 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {doubled.map((name, i) => (
          <AdopterPill key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}

export async function C2PACoalition() {
  const t = await getTranslations("c2pa");

  return (
    <section className="py-24 border-t border-iron-border/30 overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 text-center mb-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-iron-gold uppercase mb-3">
          {t("eyebrow")}
        </p>
        <h2 className="text-3xl md:text-4xl font-black text-iron-white leading-tight mb-4">
          {t("headline1")}{" "}
          <span className="text-gradient-gold">C2PA</span> —
          <br />
          {t("headline2")}
        </h2>
        <p className="text-iron-white/40 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      {/* Founding members */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <p className="text-xs text-iron-white/25 uppercase tracking-widest text-center mb-6">
          {t("foundersLabel")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FOUNDER_NAMES.map((name) => (
            <div
              key={name}
              className="rounded-2xl bg-iron-slate border border-iron-border p-4 flex flex-col items-center text-center hover:border-iron-gold/20 transition-colors"
            >
              <span className="text-base font-black text-iron-white">{name}</span>
              <span className="text-[10px] text-iron-gold/50 mt-1">{t("foundingNote")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Adopters marquee */}
      <div className="space-y-3 mb-10">
        <MarqueeRow items={ADOPTERS_ROW_A} />
        <MarqueeRow items={ADOPTERS_ROW_B} reverse />
      </div>

      {/* Trust statement */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="rounded-2xl bg-iron-gold/5 border border-iron-gold/15 p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-iron-gold/10 border border-iron-gold/20 flex items-center justify-center">
            <span className="text-iron-gold font-black text-xl">C²</span>
          </div>
          <div>
            <p className="text-sm font-bold text-iron-white mb-1">
              {t("trustBadge")}
            </p>
            <p className="text-sm text-iron-white/40 leading-relaxed">
              {t("trustDesc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
