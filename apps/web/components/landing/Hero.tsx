import Link from "next/link";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Hero() {
  const t = await getTranslations("hero");

  const trustItems = ["0", "1", "2", "3"].map((i) => t(`trust.${i}`));

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-iron-gold/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-iron-blue/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-iron-gold/20 bg-iron-gold/5 text-iron-gold text-xs font-medium mb-6">
          <Shield size={12} />
          {t("badge")}
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-iron-white leading-[1.05] tracking-tight mb-6">
          {t("headline1")}
          <br />
          <span className="text-gradient-gold">{t("headline2")}</span>
          <br />
          {t("headline3")}
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-iron-white/50 leading-relaxed mb-10">
          {t.rich("subtitle", {
            c2pa: (chunks) => (
              <strong className="text-iron-white/70">{chunks}</strong>
            ),
            ledger: (chunks) => (
              <strong className="text-iron-white/70">{chunks}</strong>
            ),
          })}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/sign-up"
            className="group flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-iron-black bg-iron-gold hover:bg-iron-gold/90 transition-all shadow-lg shadow-iron-gold/20"
          >
            {t("ctaPrimary")}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-iron-white border border-iron-border hover:bg-iron-border/40 transition-colors"
          >
            {t("ctaSecondary")}
          </Link>
        </div>

        {/* Trust items */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-iron-white/40">
              <CheckCircle size={12} className="text-iron-green" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Code snippet preview */}
      <div className="relative z-10 mt-16 max-w-2xl mx-auto w-full">
        <div className="bg-iron-slate border border-iron-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Window bar */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-iron-border bg-iron-black/40">
            <span className="w-3 h-3 rounded-full bg-iron-red/60" />
            <span className="w-3 h-3 rounded-full bg-amber-500/60" />
            <span className="w-3 h-3 rounded-full bg-iron-green/60" />
            <span className="ml-3 text-xs text-iron-white/25 font-mono">certify.ts</span>
          </div>
          {/* Code */}
          <pre className="text-sm font-mono p-5 text-iron-white/80 overflow-x-auto leading-relaxed">
            <code>
              <span className="text-iron-white/30">{"// npm install @ironid/sdk\n"}</span>
              <span className="text-purple-400">{"import"}</span>
              <span className="text-iron-white/70">{" { IronID } "}</span>
              <span className="text-purple-400">{"from"}</span>
              <span className="text-iron-green">{" '@ironid/sdk';\n\n"}</span>
              <span className="text-iron-white/50">{"const "}</span>
              <span className="text-iron-white">{"client "}</span>
              <span className="text-iron-white/50">{"= new "}</span>
              <span className="text-amber-400">{"IronID"}</span>
              <span className="text-iron-white/50">{"({ apiKey: "}</span>
              <span className="text-iron-green">{"'iid_live_...'"}</span>
              <span className="text-iron-white/50">{" });\n\n"}</span>
              <span className="text-iron-white/50">{"const "}</span>
              <span className="text-iron-white">{"cert "}</span>
              <span className="text-iron-white/50">{"= await client.certifications."}</span>
              <span className="text-amber-400">{"certifyAndWait"}</span>
              <span className="text-iron-white/50">{"({\n"}</span>
              <span className="text-iron-white/50">{"  file: "}</span>
              <span className="text-iron-white">{"imageBuffer"}</span>
              <span className="text-iron-white/50">{",\n"}</span>
              <span className="text-iron-white/50">{"  filename: "}</span>
              <span className="text-iron-green">{"'photo.jpg'"}</span>
              <span className="text-iron-white/50">{",\n"}</span>
              <span className="text-iron-white/50">{"  metadata: { author: "}</span>
              <span className="text-iron-green">{"'Jane Doe'"}</span>
              <span className="text-iron-white/50">{" },\n});\n\n"}</span>
              <span className="text-iron-white/50">{"console.log(cert."}</span>
              <span className="text-iron-white">{"file_hash_sha256"}</span>
              <span className="text-iron-white/50">{"); "}</span>
              <span className="text-iron-white/30">{"// a3f5b9c1..."}</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
