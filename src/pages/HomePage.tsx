import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

const features = [
  {
    key: "c2pa",
    title: "C2PA / Content Credentials",
    desc: "Signature cryptographique embarquée dans l'image, vérifiable sur contentcredentials.org.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    key: "watermark",
    title: "Watermark fréquentiel",
    desc: "DCT invisible et robuste à la recompression JPEG et aux réseaux sociaux.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    key: "adversarial",
    title: "Protection anti-IA",
    desc: "Perturbations adversarielles qui empêchent l'inpainting et la modification par IA.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="max-w-content mx-auto px-page py-8 sm:py-section">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto mb-8 sm:mb-section" aria-labelledby="hero-title">
        <h1 id="hero-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3 sm:mb-4 px-1 leading-tight">
          {t("home.title")}
        </h1>
        <p className="text-base md:text-lg text-ink-muted leading-relaxed tracking-[0.02em]">
          {t("home.subtitle")}
        </p>
      </section>

      {/* CTAs */}
      <section className="grid sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto mb-8 sm:mb-section" aria-label="Actions principales">
        <Link
          to="/protect"
          className="group card-hover flex flex-col items-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-card text-left min-h-touch"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-button bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:group-hover:bg-brand-200/30 transition-colors" aria-hidden>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <div className="max-w-[16rem]">
            <span className="block text-base md:text-lg font-semibold text-ink mb-1">{t("home.protect.cta")}</span>
            <span className="text-sm md:text-base text-ink-muted leading-relaxed">{t("home.protect.desc")}</span>
          </div>
        </Link>

        <Link
          to="/verify"
          className="group card-hover flex flex-col items-center gap-3 sm:gap-4 p-6 sm:p-8 rounded-card text-left min-h-touch"
        >
          <span className="flex items-center justify-center w-14 h-14 rounded-button bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-200/30 transition-colors" aria-hidden>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </span>
          <div className="max-w-[16rem]">
            <span className="block text-base md:text-lg font-semibold text-ink mb-1">{t("home.verify.cta")}</span>
            <span className="text-sm md:text-base text-ink-muted leading-relaxed">{t("home.verify.desc")}</span>
          </div>
        </Link>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">
          Fonctionnalités
        </h2>
        {features.map((f) => (
          <article key={f.key} className="card p-4 sm:p-5">
            <span className="flex items-center justify-center w-10 h-10 rounded-button bg-surface-muted text-ink-muted mb-3" aria-hidden>
              {f.icon}
            </span>
            <h3 className="font-semibold text-base md:text-lg text-ink mb-1.5 max-w-[14rem]">{f.title}</h3>
            <p className="text-sm md:text-base text-ink-muted leading-relaxed">{f.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
