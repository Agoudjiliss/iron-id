import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NavServer } from "@/components/landing/NavServer";
import { Footer }    from "@/components/landing/Footer";
import {
  Shield,
  Zap,
  Lock,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Building2,
  Infinity,
  Clock,
  FileCheck,
  Headphones,
  Globe,
} from "lucide-react";
import { EnterpriseContactForm } from "@/components/landing/EnterpriseContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IronID Enterprise — C2PA Certification at Scale",
  description:
    "Enterprise-grade C2PA certification API with unlimited throughput, dedicated support, SLA guarantees, and a 30-day proof-of-concept trial. Built for media, legal, and platform teams.",
  alternates: { canonical: "https://www.iron-id.io/enterprise" },
  openGraph: {
    title:       "IronID Enterprise — C2PA at Scale",
    description: "Unlimited API, <200 ms P95 latency, dedicated SLA. Request your 30-day enterprise trial.",
    url:         "https://www.iron-id.io/enterprise",
    type:        "website",
  },
};

const BENEFIT_ICONS = [Infinity, Zap, Lock, BarChart3, Headphones, FileCheck, Globe, Clock];

export default async function EnterprisePage() {
  const t = await getTranslations("enterprise");

  const benefits     = t.raw("benefits")     as Array<{ title: string; body: string }>;
  const trialIncludes = t.raw("trialIncludes") as string[];
  const useCases     = t.raw("useCases")     as Array<{ sector: string; stat: string; detail: string }>;
  const stats        = t.raw("stats")        as Array<{ value: string; label: string }>;

  return (
    <>
      <NavServer />
      <main className="min-h-screen bg-iron-black text-iron-white">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-iron-gold/5 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-3xl" />
          </div>

          {/* Dot grid */}
          <div
            className="absolute inset-0 -z-10 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-iron-gold/30 bg-iron-gold/10 text-iron-gold text-xs font-semibold tracking-wide mb-6">
              <Building2 size={12} />
              {t("badge")}
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              {t("headline1")}{" "}
              <span className="text-gradient-gold">{t("headline2")}</span>
            </h1>

            <p className="text-lg md:text-xl text-iron-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-iron-gold text-iron-black font-bold text-sm hover:bg-iron-gold/90 transition-colors"
              >
                {t("ctaPrimary")}
                <ArrowRight size={16} />
              </a>
              <a
                href="mailto:enterprise@iron-id.io"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-iron-border text-iron-white/70 font-semibold text-sm hover:border-iron-gold/30 hover:text-iron-white transition-colors"
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </div>
        </section>

        {/* ── Stat bar ──────────────────────────────────────────────────── */}
        <div className="border-t border-b border-iron-border/30 bg-iron-slate/30 py-8">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-black text-gradient-gold">{value}</p>
                <p className="text-xs text-iron-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Benefits grid ─────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-[0.2em] text-iron-gold uppercase mb-3">
                {t("benefitsEyebrow")}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-iron-white">
                {t("benefitsHeadline")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map(({ title, body }, i) => {
                const Icon = BENEFIT_ICONS[i] ?? Shield;
                return (
                  <div
                    key={title}
                    className="rounded-2xl border border-iron-border/60 bg-iron-slate/40 p-5 hover:border-iron-gold/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-iron-gold/10 border border-iron-gold/20 flex items-center justify-center mb-4">
                      <Icon size={16} className="text-iron-gold" />
                    </div>
                    <h3 className="text-sm font-bold text-iron-white mb-2">{title}</h3>
                    <p className="text-xs text-iron-white/45 leading-relaxed">{body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Trial includes ────────────────────────────────────────────── */}
        <section className="py-16 px-6 bg-iron-gold/5 border-t border-b border-iron-gold/10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-widest text-iron-gold uppercase mb-3">
                {t("trialEyebrow")}
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-iron-white mb-4">
                {t("trialHeadline")}
              </h2>
              <p className="text-iron-white/50 text-sm leading-relaxed">
                {t("trialDesc")}
              </p>
            </div>
            <div className="flex-1">
              <ul className="space-y-3">
                {trialIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-iron-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-iron-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Use cases ─────────────────────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold tracking-[0.2em] text-iron-gold uppercase mb-3">
                {t("useCasesEyebrow")}
              </p>
              <h2 className="text-3xl font-black text-iron-white">
                {t("useCasesHeadline")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {useCases.map(({ sector, stat, detail }) => (
                <div
                  key={sector}
                  className="rounded-2xl border border-iron-border bg-iron-slate p-6 flex items-start gap-5"
                >
                  <div className="text-center flex-shrink-0">
                    <p className="text-2xl font-black text-iron-gold">{stat}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-iron-white mb-1">{sector}</h3>
                    <p className="text-sm text-iron-white/45 leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact form ──────────────────────────────────────────────── */}
        <section id="contact" className="py-24 px-6 border-t border-iron-border/30">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[0.2em] text-iron-gold uppercase mb-3">
                {t("contactEyebrow")}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-iron-white mb-4">
                {t("contactHeadline")}
              </h2>
              <p className="text-iron-white/50 text-sm leading-relaxed">
                {t("contactDesc")}
              </p>
            </div>

            <EnterpriseContactForm />
          </div>
        </section>

        {/* ── Trust footer ──────────────────────────────────────────────── */}
        <div className="border-t border-iron-border/30 py-10 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-iron-gold" />
              <span className="text-sm text-iron-white/60">{t("trustDesc")}</span>
            </div>
            <div className="text-xs text-iron-white/25">
              {t("trustCompliance")}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
