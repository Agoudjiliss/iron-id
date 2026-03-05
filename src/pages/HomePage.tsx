import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useI18n } from "../i18n";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-page overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-iron-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-iron-glow/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-iron-secondary/5 rounded-full blur-[150px]" />
      </div>

      {/* Scan animation */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { delay: 0.5, duration: 1 },
          },
        }}
      >
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl border border-iron-primary/30 bg-iron-surface/80 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-iron-primary/5 to-transparent animate-scan" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full border-2 border-iron-secondary bg-iron-secondary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-8 h-8 text-iron-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("home.hero.title")}
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-iron-muted max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("home.hero.subtitle")}
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/protect"
            className="btn-primary group"
          >
            {t("home.cta.protect")}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link to="#how-it-works" className="btn-secondary">
            {t("home.cta.how")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.article
      ref={ref}
      className="glass-card group"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-12 h-12 rounded-xl bg-iron-primary/20 flex items-center justify-center text-iron-primary mb-4 group-hover:bg-iron-primary/30 transition-colors">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-xl text-white mb-2">{title}</h3>
      <p className="text-iron-muted leading-relaxed">{desc}</p>
    </motion.article>
  );
}

function FeaturesSection() {
  const { t } = useI18n();
  const features = [
    {
      key: "authenticity",
      title: t("home.feature1.title"),
      desc: t("home.feature1.desc"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "detection",
      title: t("home.feature2.title"),
      desc: t("home.feature2.desc"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "proof",
      title: t("home.feature3.title"),
      desc: t("home.feature3.desc"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];
  return (
    <section className="py-section px-page">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Built for trust
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Three layers of protection. One verifiable truth.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.key} icon={f.icon} title={f.title} desc={f.desc} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const steps = [
    { num: "01", title: t("home.step1"), icon: "↑" },
    { num: "02", title: t("home.step2"), icon: "◇" },
    { num: "03", title: t("home.step3"), icon: "✓" },
  ];
  return (
    <section id="how-it-works" className="py-section px-page" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Three simple steps to verified authenticity
        </motion.p>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex flex-col items-center text-center flex-1"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
            >
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-iron-primary font-display font-bold text-xl mb-4 border-iron-primary/20">
                {step.num}
              </div>
              <p className="text-white font-medium mb-2">{step.title}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-1 max-w-[80px] mt-4">
                  <svg className="w-full h-4 text-iron-primary/40" fill="none" viewBox="0 0 24 8" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="M0 4h24" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisualStorySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section className="py-section px-page" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Original → Manipulated → Verified
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          See the difference. Trust the proof.
        </motion.p>
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {["Original", "AI Modified", "Verified"].map((label, i) => (
            <div key={label} className="glass rounded-2xl p-4 border border-white/10 overflow-hidden">
              <div className="aspect-square bg-iron-surface rounded-xl mb-3 flex items-center justify-center">
                <span className="text-iron-muted/50 text-4xl font-display font-bold">{i + 1}</span>
              </div>
              <p className="text-iron-muted text-sm text-center">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrustSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const roles = [
    { key: "journalists", label: t("home.trust.journalists"), icon: "📰" },
    { key: "photographers", label: t("home.trust.photographers"), icon: "📷" },
    { key: "newsrooms", label: t("home.trust.newsrooms"), icon: "🏢" },
    { key: "brands", label: t("home.trust.brands"), icon: "✨" },
    { key: "creators", label: t("home.trust.creators"), icon: "🎬" },
  ];
  return (
    <section className="py-section px-page" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Built for those who protect the truth
        </motion.h2>
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {roles.map((r, i) => (
            <motion.div
              key={r.key}
              className="glass-card px-6 py-4 flex items-center gap-3"
              whileHover={{ scale: 1.02, borderColor: "rgba(79, 140, 255, 0.3)" }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-2xl">{r.icon}</span>
              <span className="font-medium text-white">{r.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useI18n();
  return (
    <section className="py-section px-page">
      <motion.div
        className="max-w-4xl mx-auto glass rounded-3xl p-12 sm:p-16 text-center border border-iron-primary/20 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="relative z-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to protect your images?
          </h2>
          <p className="text-iron-muted mb-8 max-w-xl mx-auto">
            Join creators and journalists who trust Iron-ID to verify authenticity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/protect" className="btn-primary">
              {t("home.cta.protect")}
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
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <VisualStorySection />
      <TrustSection />
      <CTASection />
    </div>
  );
}
