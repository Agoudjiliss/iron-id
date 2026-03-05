import { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useI18n } from "../i18n";

/* ----- Hero: immersive artwork + scan + stamp ----- */
function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-page overflow-hidden grain">
      <div className="absolute inset-0 spotlight pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-iron-black/80 pointer-events-none z-[1]" />

      {/* Artwork frame with scan animation */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative aspect-[4/3] max-h-[55vh] rounded-lg overflow-hidden border border-white/10 bg-iron-deep shadow-exhibit">
          {/* Abstract "artwork" background */}
          <div className="absolute inset-0 bg-art-1" />
          <div className="absolute inset-0 bg-gradient-to-t from-iron-black/60 via-transparent to-transparent" />
          {/* Scanning light */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-iron-neon-blue/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2.2, delay: 0.8, ease: "easeInOut" }}
            />
          </div>
          {/* Verified Authentic stamp */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 2.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="px-6 py-3 rounded-lg border-2 border-iron-neon-blue/80 bg-iron-neon-blue/10 backdrop-blur-sm shadow-glow">
              <span className="font-display font-bold text-lg tracking-wider text-iron-neon-blue">
                {t("home.verified.stamp")}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-iron-white mb-5">
          {t("home.hero.art.title")}
        </h1>
        <p className="text-lg sm:text-xl text-iron-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("home.hero.art.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/protect" className="btn-primary group">
            {t("home.cta.work")}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a href="#technology" className="btn-secondary">
            {t("home.cta.tech")}
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ----- Tagline ----- */
function TaglineSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className="py-16 sm:py-24 px-page relative grain">
      <motion.p
        className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-center text-iron-white/90 max-w-3xl mx-auto italic"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        &ldquo;{t("home.tagline")}&rdquo;
      </motion.p>
    </section>
  );
}

/* ----- Artist Showcase: exhibit cards with hover metadata ----- */
function ArtistShowcaseSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const exhibits = [
    { id: 1, gradient: "bg-art-1", title: "Untitled #1", meta: "C2PA · Watermark · 2025" },
    { id: 2, gradient: "bg-art-2", title: "Untitled #2", meta: "Signature verified · 2025" },
    { id: 3, gradient: "bg-art-3", title: "Untitled #3", meta: "Authentic · Tamper-proof" },
  ];
  return (
    <section ref={ref} className="py-section px-page relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-iron-white text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {t("home.showcase.title")}
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("home.showcase.subtitle")}
        </motion.p>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {exhibits.map((ex, i) => (
            <motion.div
              key={ex.id}
              className="group exhibit-frame cursor-default"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
            >
              <div className={`aspect-[4/5] ${ex.gradient} relative transition-transform duration-500 group-hover:scale-[1.02]`}>
                <div className="absolute inset-0 bg-gradient-to-t from-iron-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <p className="font-display font-semibold text-iron-white">{ex.title}</p>
                  <p className="text-sm text-iron-neon-blue font-mono mt-1">{ex.meta}</p>
                  <div className="mt-2 h-px w-12 bg-iron-neon-blue/60" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- AI Comparison: interactive slider ----- */
function ComparisonSection() {
  const { t } = useI18n();
  const [slide, setSlide] = useState<0 | 1 | 2>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const labels = [t("home.comparison.original"), t("home.comparison.manipulated"), t("home.comparison.verified")];
  return (
    <section id="comparison" ref={ref} className="py-section px-page relative grain">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-iron-white text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {t("home.comparison.title")}
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("home.comparison.subtitle")}
        </motion.p>
        <div className="flex gap-2 justify-center mb-6">
          {([0, 1, 2] as const).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                slide === i
                  ? "bg-iron-neon-blue text-white"
                  : "bg-white/5 text-iron-muted hover:bg-white/10 hover:text-iron-white border border-white/10"
              }`}
            >
              {labels[i]}
            </button>
          ))}
        </div>
        <motion.div
          className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-iron-deep shadow-exhibit"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-art-1" />
          {slide === 0 && <div className="absolute inset-0 bg-gradient-to-r from-iron-deep/40 to-transparent" />}
          {slide === 1 && (
            <>
              <div className="absolute inset-0 bg-art-2 opacity-80 mix-blend-overlay" />
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-mono">
                AI Modified
              </div>
            </>
          )}
          {slide === 2 && (
            <>
              <div className="absolute inset-0 bg-art-1" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-6 py-3 rounded-lg border-2 border-iron-neon-blue/80 bg-iron-neon-blue/10 backdrop-blur-sm">
                  <span className="font-display font-bold text-iron-neon-blue">{t("home.verified.stamp")}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ----- Features: floating glass panels ----- */
function FeaturesSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 0.3], [0, 30]);
  const y2 = useTransform(scrollYProgress, [0, 0.35], [0, -20]);
  const y3 = useTransform(scrollYProgress, [0, 0.4], [0, 25]);

  const features = [
    {
      key: "authenticity",
      title: t("home.features.authenticity"),
      desc: t("home.feature1.desc"),
      y: y1,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      key: "detection",
      title: t("home.features.detection"),
      desc: t("home.feature2.desc"),
      y: y2,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "signature",
      title: t("home.features.signature"),
      desc: t("home.feature3.desc"),
      y: y3,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="technology" ref={ref} className="py-section px-page relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-iron-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {t("home.section.features.title")}
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t("home.section.features.subtitle")}
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              className="glass-panel"
              style={{ y: f.y }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
            >
              <motion.div
                className="w-14 h-14 rounded-xl bg-iron-neon-blue/20 flex items-center justify-center text-iron-neon-blue mb-5"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {f.icon}
              </motion.div>
              <h3 className="font-display font-semibold text-xl text-iron-white mb-2">{f.title}</h3>
              <p className="text-iron-muted leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- Final CTA ----- */
function FinalCTASection() {
  const { t } = useI18n();
  return (
    <section className="py-section px-page relative grain">
      <motion.div
        className="max-w-4xl mx-auto glass rounded-3xl p-12 sm:p-20 text-center border border-white/10 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute inset-0 spotlight opacity-50" />
        <div className="relative z-10">
          <p className="font-display text-xl sm:text-2xl text-iron-white/90 mb-4 italic">&ldquo;{t("home.tagline")}&rdquo;</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-iron-white mb-6">
            {t("home.section.cta.title")}
          </h2>
          <p className="text-iron-muted mb-10 max-w-xl mx-auto">{t("home.section.cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/protect" className="btn-primary">
              {t("home.cta.work")}
            </Link>
            <Link to="/verify" className="btn-secondary">
              {t("home.verify.cta")}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (hash === "#technology" || hash === "#comparison") {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-iron-black">
      <HeroSection />
      <TaglineSection />
      <ArtistShowcaseSection />
      <ComparisonSection />
      <FeaturesSection />
      <FinalCTASection />
    </div>
  );
}
