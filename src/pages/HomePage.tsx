import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

const features = [
  {
    key: "c2pa",
    title: "C2PA / Content Credentials",
    desc: "Signature cryptographique embarquée dans l'image, vérifiable sur contentcredentials.org.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    key: "watermark",
    title: "Watermark fréquentiel",
    desc: "DCT invisible et robuste à la recompression JPEG et aux réseaux sociaux.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    key: "adversarial",
    title: "Protection anti-IA",
    desc: "Perturbations adversarielles qui empêchent l'inpainting et la modification par IA.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="max-w-content mx-auto px-page py-section">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto mb-section">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-4">
          {t("home.title")}
        </h1>
        <p className="text-lg text-ink-muted leading-relaxed">
          {t("home.subtitle")}
        </p>
      </section>

      {/* CTAs */}
      <section className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-section">
        <Link
          to="/protect"
          className="group card-hover flex flex-col items-center gap-4 p-8 rounded-card text-left"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-button bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <div>
            <span className="block text-lg font-semibold text-ink mb-1">{t("home.protect.cta")}</span>
            <span className="text-sm text-ink-muted">{t("home.protect.desc")}</span>
          </div>
        </Link>

        <Link
          to="/verify"
          className="group card-hover flex flex-col items-center gap-4 p-8 rounded-card text-left"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-button bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </span>
          <div>
            <span className="block text-lg font-semibold text-ink mb-1">{t("home.verify.cta")}</span>
            <span className="text-sm text-ink-muted">{t("home.verify.desc")}</span>
          </div>
        </Link>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {features.map((f) => (
          <div key={f.key} className="card p-5">
            <span className="flex items-center justify-center w-10 h-10 rounded-button bg-slate-100 text-ink-muted mb-3">
              {f.icon}
            </span>
            <h3 className="font-semibold text-ink mb-1.5">{f.title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
