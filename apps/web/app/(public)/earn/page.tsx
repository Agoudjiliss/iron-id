import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NavServer } from "@/components/landing/NavServer";
import { Footer }    from "@/components/landing/Footer";
import { AffiliateCalculator } from "@/components/landing/AffiliateCalculator";

export const dynamic = "force-dynamic";
import {
  Shield, Link2, Users, DollarSign, TrendingUp, ArrowRight,
  CheckCircle, Zap, Wallet, BarChart3, Clock, Infinity,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Program — Earn up to 20% with IronID",
  description:
    "Recommend IronID and earn up to 20% recurring commission on every subscription. 100% free, automatic PayPal payments, 90-day cookie.",
  alternates: { canonical: "https://www.iron-id.io/earn" },
  openGraph: {
    title:       "IronID Affiliate Program — 10 to 20% recurring commission",
    description: "Share your link, earn up to 20% every month as long as your referrals stay subscribed. Free, no credit card.",
    url:         "https://www.iron-id.io/earn",
    type:        "website",
  },
};

// ─── Static tier data (rates/colors never change) ────────────────────────────
const TIERS = [
  { name: "Iron",     rate: "10%", referrals: "0 – 5",   textColor: "text-zinc-300",   glowColor: "shadow-[0_0_30px_rgba(113,113,122,0.15)]",  borderColor: "border-zinc-700/40",    bgColor: "bg-zinc-900/60",    barColor: "bg-zinc-500",   example: "$2.90" },
  { name: "Silver",   rate: "12%", referrals: "6 – 20",  textColor: "text-slate-200",  glowColor: "shadow-[0_0_30px_rgba(148,163,184,0.1)]",   borderColor: "border-slate-500/30",   bgColor: "bg-slate-800/40",   barColor: "bg-slate-400",  example: "$3.48" },
  { name: "Gold",     rate: "15%", referrals: "21 – 49", textColor: "text-amber-300",  glowColor: "shadow-[0_0_40px_rgba(217,119,6,0.2)]",     borderColor: "border-amber-500/40",   bgColor: "bg-amber-950/30",   barColor: "bg-amber-400",  example: "$4.35", highlight: true },
  { name: "Platinum", rate: "20%", referrals: "50+",     textColor: "text-emerald-300",glowColor: "shadow-[0_0_50px_rgba(16,185,129,0.25)]",   borderColor: "border-emerald-500/40", bgColor: "bg-emerald-950/30", barColor: "bg-emerald-400",example: "$5.80" },
];

const STEP_ICONS  = [Shield, Link2, Users, Wallet];
const STEP_COLORS = ["text-emerald-400", "text-sky-400", "text-violet-400", "text-emerald-400"];
const STEP_BG     = ["bg-emerald-500/10 border-emerald-500/20", "bg-sky-500/10 border-sky-500/20", "bg-violet-500/10 border-violet-500/20", "bg-emerald-500/10 border-emerald-500/20"];
const STEP_NS     = ["01", "02", "03", "04"];

const STAT_VALUES  = ["20%", "90j", "J+30", "∞"];
const TRUST_ICONS  = [CheckCircle, Clock, Wallet, Infinity];
const WHY_ICONS    = [TrendingUp, Zap, Shield];
const WHY_COLORS   = ["text-emerald-400", "text-violet-400", "text-sky-400"];
const WHY_GLOW     = ["bg-emerald-500/10 border-emerald-500/20", "bg-violet-500/10 border-violet-500/20", "bg-sky-500/10 border-sky-500/20"];

const GRAD = "linear-gradient(135deg, #34d399 0%, #10b981 40%, #6ee7b7 100%)";

export default async function EarnPage() {
  const t = await getTranslations("earn");

  const trustPills = (["0","1","2","3"] as const).map((i, idx) => ({
    label: t(`trustPills.${i}`),
    Icon:  TRUST_ICONS[idx],
  }));

  const stats = (["0","1","2","3"] as const).map((i, idx) => ({
    value: STAT_VALUES[idx],
    label: t(`stats.${i}.label`),
    sub:   t(`stats.${i}.sub`),
  }));

  const steps = (["0","1","2","3"] as const).map((i, idx) => ({
    n:     STEP_NS[idx],
    Icon:  STEP_ICONS[idx],
    color: STEP_COLORS[idx],
    bg:    STEP_BG[idx],
    title: t(`steps.${i}.title`),
    body:  t(`steps.${i}.body`),
  }));

  const whyCards = (["0","1","2"] as const).map((i, idx) => ({
    Icon:  WHY_ICONS[idx],
    color: WHY_COLORS[idx],
    glow:  WHY_GLOW[idx],
    title: t(`whyCards.${i}.title`),
    body:  t(`whyCards.${i}.body`),
  }));

  const faqItems = (["0","1","2","3","4","5"] as const).map((i) => ({
    q: t(`faq.${i}.q`),
    a: t(`faq.${i}.a`),
  }));

  return (
    <>
      <NavServer />

      <main className="bg-[#050510] text-iron-white min-h-screen overflow-hidden">

        {/* ── Ambient orbs ── */}
        <div aria-hidden className="pointer-events-none fixed inset-0">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[130px]" />
          <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500/6 blur-[100px]" />
        </div>

        {/* ── Dot grid ── */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <div className="relative z-10">

          {/* ── Ticker ── */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 overflow-hidden py-2">
            <div className="flex gap-10 animate-marquee w-max text-xs font-mono text-emerald-400/70 uppercase tracking-widest">
              {Array(6).fill([
                t("badge"), t("trustPills.1"), t("trustPills.2"), t("trustPills.3"), t("trustPills.0"),
              ]).flat().map((label, i) => (
                <span key={i} className="flex-shrink-0">◆ {label}</span>
              ))}
            </div>
          </div>

          {/* ── HERO ── */}
          <section className="pt-28 pb-20 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("badge")}
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.02] mb-6 tracking-tight">
                {t("headline1")}
                <br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                  {t("headline2")}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/sign-up"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold
                    bg-emerald-500 text-white hover:bg-emerald-400 transition-all
                    shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-[1.02]"
                >
                  {t("ctaPrimary")}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium
                    bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-emerald-500/30 hover:bg-white/8 transition-colors"
                >
                  {t("ctaSecondary")}
                </a>
              </div>

              {/* Trust pills */}
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {trustPills.map(({ label, Icon }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 border border-white/8 text-xs text-white/40"
                  >
                    <Icon size={11} className="text-emerald-400" /> {label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ── STATS BAND ── */}
          <section className="px-6 pb-20">
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-sm p-1">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
                  {stats.map(({ value, label, sub }, i) => {
                    const Icon = [BarChart3, Clock, DollarSign, TrendingUp][i];
                    return (
                      <div key={label} className="flex flex-col items-center justify-center py-7 px-4 text-center">
                        <Icon size={15} className="text-emerald-400/60 mb-3" />
                        <p className="text-3xl font-black text-white tabular-nums mb-0.5">{value}</p>
                        <p className="text-[11px] text-white/50 font-medium">{label}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className="px-6 py-20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">{t("howEyebrow")}</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  {t("howHeadline1")}{" "}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                    {t("howHeadline2")}
                  </span>
                </h2>
                <p className="text-white/35 max-w-lg mx-auto text-sm">{t("howDesc")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {steps.map((step) => (
                  <div
                    key={step.n}
                    className="group relative rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 p-6 flex gap-5 transition-all duration-300 hover:bg-white/5"
                  >
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${step.bg}`}>
                      <step.Icon size={18} className={step.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-white/20 mb-1">{step.n}</p>
                      <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{step.body}</p>
                    </div>
                    <span className="absolute top-4 right-4 text-[10px] font-mono text-white/10">{step.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMISSION TIERS ── */}
          <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">{t("tiersEyebrow")}</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  {t("tiersHeadline1")}{" "}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                    {t("tiersHeadline2")}
                  </span>
                </h2>
                <p className="text-white/35 max-w-lg mx-auto text-sm">{t("tiersSubtitle")}</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {TIERS.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-2xl border p-6 flex flex-col items-center text-center gap-2 backdrop-blur-sm transition-all duration-300
                      ${tier.bgColor} ${tier.borderColor} ${tier.glowColor}
                      ${tier.highlight ? "scale-[1.04] z-10" : "hover:scale-[1.02]"}`}
                  >
                    {tier.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                        {t("popular")}
                      </span>
                    )}
                    <p className={`text-xs font-bold uppercase tracking-widest ${tier.textColor}`}>{tier.name}</p>
                    <p className={`text-5xl font-black ${tier.textColor} leading-none`}>{tier.rate}</p>
                    <p className="text-[11px] text-white/35">{tier.referrals} {t("activeReferrals")}</p>
                    <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${tier.barColor}`} style={{ width: `${25 * (i + 1)}%` }} />
                    </div>
                    <div className="mt-2 pt-3 border-t border-white/8 w-full">
                      <p className="text-[10px] text-white/25 mb-0.5">{t("perReferralPerMonth")}</p>
                      <p className={`text-base font-bold ${tier.textColor}`}>{tier.example}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-white/20 mt-6">{t("tiersFooter")}</p>
            </div>
          </section>

          {/* ── CALCULATOR ── */}
          <section className="px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">{t("calcEyebrow")}</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  {t("calcHeadline1")}{" "}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                    {t("calcHeadline2")}
                  </span>
                </h2>
                <p className="text-white/35 text-sm">{t("calcDesc")}</p>
              </div>
              <AffiliateCalculator />
            </div>
          </section>

          {/* ── WHY IRONID ── */}
          <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-400/60 font-semibold mb-3">{t("whyEyebrow")}</p>
                <h2 className="text-3xl font-black">
                  {t("whyHeadline1")}{" "}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                    {t("whyHeadline2")}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {whyCards.map(({ Icon, title, body, color, glow }) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-white/3 border border-white/8 p-6 hover:bg-white/5 hover:border-white/15 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${glow}`}>
                      <Icon size={18} className={color} />
                    </div>
                    <h3 className="font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="px-6 py-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-center mb-8">{t("faqTitle")}</h2>
              <div className="space-y-2">
                {faqItems.map(({ q, a }) => (
                  <details
                    key={q}
                    className="group rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/20 overflow-hidden transition-colors"
                  >
                    <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-white/70 hover:text-white list-none flex items-center justify-between select-none">
                      {q}
                      <span className="text-white/25 group-open:rotate-180 transition-transform text-lg leading-none flex-shrink-0 ml-3">⌄</span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-white/40 leading-relaxed border-t border-white/6 pt-3">{a}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="px-6 py-28">
            <div className="max-w-2xl mx-auto">
              <div
                className="rounded-3xl border border-emerald-500/20 p-10 text-center relative overflow-hidden"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, rgba(5,5,16,0) 70%)" }}
              >
                <div aria-hidden className="absolute top-0 left-0 w-20 h-20 border-t border-l border-emerald-500/20 rounded-tl-3xl" />
                <div aria-hidden className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-emerald-500/20 rounded-br-3xl" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
                  <CheckCircle size={11} /> {t("ctaFinalBadge")}
                </div>

                <h2 className="text-4xl sm:text-5xl font-black mb-4">
                  {t("ctaFinalHeadline1")}{" "}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD }}>
                    {t("ctaFinalHeadline2")}
                  </span>
                </h2>

                <p className="text-white/35 mb-8 text-base max-w-md mx-auto">{t("ctaFinalSubtitle")}</p>

                <a
                  href="/sign-up"
                  className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-base font-bold
                    bg-emerald-500 text-white hover:bg-emerald-400 transition-all
                    shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_60px_rgba(16,185,129,0.55)] hover:scale-[1.02]"
                >
                  {t("ctaFinalBtn")} <ArrowRight size={16} />
                </a>

                <p className="mt-5 text-xs text-white/20">
                  {t("alreadyAffiliate")}{" "}
                  <a href="/sign-in" className="text-emerald-400/60 hover:text-emerald-400 underline underline-offset-2">
                    {t("signInLink")}
                  </a>{" "}
                  {t("toDashboard")}
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
