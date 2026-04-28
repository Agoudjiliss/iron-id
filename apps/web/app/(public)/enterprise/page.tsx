import type { Metadata } from "next";
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

const BENEFITS = [
  {
    Icon: Infinity,
    title: "Unlimited Certifications",
    body:  "No monthly cap. Certify millions of assets per day — images, video, PDFs, audio — with no throttling.",
  },
  {
    Icon: Zap,
    title: "<200 ms P95 Latency",
    body:  "Sub-second response times, verified by our public benchmark tool. Edge-distributed infrastructure.",
  },
  {
    Icon: Lock,
    title: "C2PA Certified & Auditable",
    body:  "Every signature is immutably recorded on a cryptographic ledger. Tamper-evident, court-admissible provenance.",
  },
  {
    Icon: BarChart3,
    title: "Real-Time Analytics",
    body:  "Full visibility into certification volumes, per-asset lineage, and API usage from your dashboard.",
  },
  {
    Icon: Headphones,
    title: "Dedicated Account Manager",
    body:  "Priority Slack channel, a named account manager, and monthly review calls during and after the trial.",
  },
  {
    Icon: FileCheck,
    title: "Custom SLA & NDA",
    body:  "99.9% uptime SLA, GDPR DPA, and a mutual NDA signed before we share any sensitive integration details.",
  },
  {
    Icon: Globe,
    title: "Multi-Region & On-Premise Option",
    body:  "Deploy within your own cloud or leverage our EU / US regions. Custom data residency available.",
  },
  {
    Icon: Clock,
    title: "30-Day Proof of Concept",
    body:  "Full enterprise access, no credit card. Evaluate throughput, integrate with your stack, then decide.",
  },
];

const TRIAL_INCLUDES = [
  "Enterprise plan activated within 24 hours",
  "Unlimited certifications for 30 days",
  "Dedicated onboarding session (video call)",
  "Access to private benchmark tool & results",
  "Integration support via Slack",
  "Formal NDA / convention available on request",
  "Custom metadata schema support",
  "Webhook delivery with retry guarantees",
];

const USE_CASES = [
  { sector: "Media & Journalism",       stat: "86%",  detail: "of misinformation involves manipulated images. IronID proves authenticity at source." },
  { sector: "Legal & Digital Evidence", stat: "J+0",  detail: "Certified assets carry tamper-evident provenance — accepted in arbitration and court." },
  { sector: "Generative AI Platforms",  stat: "100%", detail: "Every AI-generated image automatically tagged with C2PA content credentials." },
  { sector: "Government & Public",      stat: "190+", detail: "Countries using C2PA infrastructure for official content verification." },
];

export default function EnterprisePage() {
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
              Enterprise Program — by invitation & application
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              C2PA Certification{" "}
              <span className="text-gradient-gold">at Enterprise Scale</span>
            </h1>

            <p className="text-lg md:text-xl text-iron-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Unlimited API, &lt;200 ms latency, immutable provenance ledger.
              <br />
              30-day proof-of-concept trial — no commitment required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-iron-gold text-iron-black font-bold text-sm hover:bg-iron-gold/90 transition-colors"
              >
                Request Enterprise Trial
                <ArrowRight size={16} />
              </a>
              <a
                href="mailto:enterprise@iron-id.io"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-iron-border text-iron-white/70 font-semibold text-sm hover:border-iron-gold/30 hover:text-iron-white transition-colors"
              >
                Contact Sales Directly
              </a>
            </div>
          </div>
        </section>

        {/* ── Stat bar ──────────────────────────────────────────────────── */}
        <div className="border-t border-b border-iron-border/30 bg-iron-slate/30 py-8">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "<200 ms", label: "P95 Latency" },
              { value: "∞",       label: "Monthly Certifications" },
              { value: "99.9%",   label: "Uptime SLA" },
              { value: "C2PA",    label: "Coalition Certified" },
            ].map(({ value, label }) => (
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
                What's included
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-iron-white">
                Everything your team needs
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {BENEFITS.map(({ Icon, title, body }) => (
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
              ))}
            </div>
          </div>
        </section>

        {/* ── Trial includes ────────────────────────────────────────────── */}
        <section className="py-16 px-6 bg-iron-gold/5 border-t border-b border-iron-gold/10">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-widest text-iron-gold uppercase mb-3">
                30-day trial
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-iron-white mb-4">
                Full enterprise access,<br />zero risk
              </h2>
              <p className="text-iron-white/50 text-sm leading-relaxed">
                We activate your enterprise plan within 24 hours of your application.
                You get full API access, onboarding support, and a dedicated Slack channel
                — no credit card, no auto-charge.
              </p>
            </div>
            <div className="flex-1">
              <ul className="space-y-3">
                {TRIAL_INCLUDES.map((item) => (
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
                Trusted sectors
              </p>
              <h2 className="text-3xl font-black text-iron-white">
                Built for high-stakes industries
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {USE_CASES.map(({ sector, stat, detail }) => (
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
                Apply now
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-iron-white mb-4">
                Request your enterprise trial
              </h2>
              <p className="text-iron-white/50 text-sm leading-relaxed">
                Fill in the form. Our team reviews every application and responds within one business day.
                An NDA is available on request before any technical disclosure.
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
              <span className="text-sm text-iron-white/60">
                IronID is a founding-certified C2PA implementation partner.
              </span>
            </div>
            <div className="text-xs text-iron-white/25 space-x-4">
              <span>GDPR compliant</span>
              <span>•</span>
              <span>SOC 2 Type II (in progress)</span>
              <span>•</span>
              <span>NDA available</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
