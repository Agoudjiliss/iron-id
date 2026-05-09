import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// ─── Founding member SVG logos (inline, monochrome — adapts to dark theme) ────

function AdobeLogo() {
  return (
    <svg
      className="h-9 w-auto"
      viewBox="0 0 60 56"
      fill="currentColor"
      aria-label="Adobe"
    >
      {/* Adobe "A" mark — two angled beams */}
      <path d="M30 0L0 56H16L30 20Z" />
      <path d="M30 0L30 20L44 56H60Z" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 21 21"
      fill="currentColor"
      aria-label="Microsoft"
    >
      {/* Windows 4-square symbol */}
      <rect x="0"  y="0"  width="9" height="9" />
      <rect x="12" y="0"  width="9" height="9" />
      <rect x="0"  y="12" width="9" height="9" />
      <rect x="12" y="12" width="9" height="9" />
    </svg>
  );
}

function BBCLogo() {
  return (
    <svg
      className="h-6 w-auto"
      viewBox="0 0 78 26"
      aria-label="BBC"
    >
      {/* Three white boxes with dark letters — the actual BBC logo */}
      <rect x="0"  y="0" width="24" height="26" rx="2" fill="white" />
      <text
        x="12" y="20"
        textAnchor="middle"
        fontSize="19" fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#0e0e1a"
      >B</text>

      <rect x="27" y="0" width="24" height="26" rx="2" fill="white" />
      <text
        x="39" y="20"
        textAnchor="middle"
        fontSize="19" fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#0e0e1a"
      >B</text>

      <rect x="54" y="0" width="24" height="26" rx="2" fill="white" />
      <text
        x="66" y="20"
        textAnchor="middle"
        fontSize="19" fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#0e0e1a"
      >C</text>
    </svg>
  );
}

function IntelLogo() {
  return (
    <svg
      className="h-8 w-auto"
      viewBox="0 0 72 28"
      aria-label="Intel"
      fill="currentColor"
    >
      <text
        x="36" y="22"
        textAnchor="middle"
        fontSize="22"
        fontWeight="300"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        letterSpacing="1"
      >intel</text>
    </svg>
  );
}

function ArmLogo() {
  return (
    <svg
      className="h-8 w-auto"
      viewBox="0 0 52 28"
      aria-label="Arm"
      fill="currentColor"
    >
      <text
        x="26" y="22"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
      >arm</text>
    </svg>
  );
}

function TruepicLogo() {
  return (
    <div className="flex items-center gap-1.5">
      {/* Shield outline with checkmark */}
      <svg
        className="h-6 w-auto"
        viewBox="0 0 20 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Truepic"
      >
        <path d="M10 1L1 4.5V11.5C1 17.2 4.8 21.2 10 22C15.2 21.2 19 17.2 19 11.5V4.5L10 1Z" />
        <path d="M6.5 11.5l2.5 2.5 4.5-4.5" />
      </svg>
      <span
        className="text-[13px] font-bold tracking-tight"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        truepic
      </span>
    </div>
  );
}

// ─── Logo registry ─────────────────────────────────────────────────────────────

type LogoFC = () => ReactNode;

const FOUNDER_LOGOS: Record<string, LogoFC> = {
  Adobe:     AdobeLogo,
  Microsoft: MicrosoftLogo,
  BBC:       BBCLogo,
  Intel:     IntelLogo,
  Arm:       ArmLogo,
  Truepic:   TruepicLogo,
};

const FOUNDER_NAMES = ["Adobe", "Microsoft", "BBC", "Intel", "Arm", "Truepic"];

// ─── Adopters marquee ──────────────────────────────────────────────────────────

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

// ─── Main section ──────────────────────────────────────────────────────────────

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

      {/* Founding members — logo cards */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <p className="text-xs text-iron-white/25 uppercase tracking-widest text-center mb-6">
          {t("foundersLabel")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FOUNDER_NAMES.map((name) => {
            const Logo = FOUNDER_LOGOS[name];
            return (
              <div
                key={name}
                className="rounded-2xl bg-iron-slate border border-iron-border p-5 flex flex-col items-center justify-center gap-3 min-h-[88px] hover:border-iron-gold/30 hover:bg-iron-slate/80 transition-all duration-200 text-iron-white/75 hover:text-iron-white/90 group"
              >
                {Logo ? <Logo /> : (
                  <span className="text-base font-black">{name}</span>
                )}
                <span className="text-[10px] text-iron-gold/40 group-hover:text-iron-gold/60 transition-colors">
                  {t("foundingNote")}
                </span>
              </div>
            );
          })}
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
