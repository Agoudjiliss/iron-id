import { useRef, useMemo, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useI18n } from "../i18n";

/* ────────────────────────────────────────────────────────
   Deterministic particle field (no random on render)
──────────────────────────────────────────────────────── */
const PARTICLE_DATA = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: Number(((i * 137.508 + 11.5) % 100).toFixed(2)),
  y: Number(((i * 73.21 + 33.1) % 100).toFixed(2)),
  size: Number((((i * 7.33) % 1.8) + 0.5).toFixed(2)),
  duration: Number((((i * 5.7) % 22) + 12).toFixed(1)),
  delay: Number((((i * 3.14) % 9)).toFixed(1)),
  purple: i % 3 === 0,
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLE_DATA.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.purple
              ? "rgba(139, 92, 246, 0.55)"
              : "rgba(59, 130, 246, 0.5)",
          }}
          animate={{ y: [0, -55, 0], opacity: [0, 0.75, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Museum corner brackets
──────────────────────────────────────────────────────── */
function MuseumCorners({ color = "rgba(59,130,246,0.5)" }: { color?: string }) {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: color,
    borderStyle: "solid",
    pointerEvents: "none",
    zIndex: 20,
    transition: "border-color 0.4s ease",
  };
  return (
    <>
      <div style={{ ...base, top: 10, left: 10, borderWidth: "2px 0 0 2px", borderRadius: "1px 0 0 0" }} />
      <div style={{ ...base, top: 10, right: 10, borderWidth: "2px 2px 0 0", borderRadius: "0 1px 0 0" }} />
      <div style={{ ...base, bottom: 10, left: 10, borderWidth: "0 0 2px 2px", borderRadius: "0 0 0 1px" }} />
      <div style={{ ...base, bottom: 10, right: 10, borderWidth: "0 2px 2px 0", borderRadius: "0 0 1px 0" }} />
    </>
  );
}

/* ────────────────────────────────────────────────────────
   HERO — cinematic artwork with scan + verified stamp
──────────────────────────────────────────────────────── */
function HeroSection() {
  const { t } = useI18n();
  const [stampDone, setStampDone] = useState(false);

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-page overflow-hidden grain">
      {/* Deep atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-iron-deep/15 via-iron-black to-iron-black" />

      {/* Gallery ceiling spotlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 55%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Floating particles */}
      <ParticleField />

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-iron-black z-[2] pointer-events-none" />

      {/* ── Artwork frame ──────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ambient outer glow */}
        <div
          className="absolute -inset-6 rounded-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Main frame */}
        <div
          className="relative aspect-[16/9] max-h-[56vh] rounded-2xl overflow-hidden border border-white/10 bg-iron-deep shadow-exhibit"
          style={{ transition: "box-shadow 0.5s ease" }}
        >
          {/* Rich artwork background */}
          <div className="absolute inset-0 bg-art-hero" />

          {/* Inner atmospheric light */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 60% at 30% 40%, rgba(59,130,246,0.06) 0%, transparent 60%)",
            }}
          />

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-iron-black/60 via-transparent to-iron-black/25 pointer-events-none" />

          {/* Museum corner markers */}
          <MuseumCorners />

          {/* Scanning beam */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-0 bottom-0 w-48"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.08) 30%, rgba(147,197,253,0.35) 50%, rgba(59,130,246,0.08) 70%, transparent 100%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "160%" }}
              transition={{ duration: 2.6, delay: 0.9, ease: "easeInOut" }}
            />
          </div>

          {/* Analysis grid flash during scan */}
          <motion.div
            className="absolute inset-0 grid-bg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.06, 0] }}
            transition={{ duration: 2.4, delay: 0.9 }}
          />

          {/* "Verified Authentic" stamp */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.45 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 2.9, ease: [0.34, 1.56, 0.64, 1] }}
            onAnimationComplete={() => setStampDone(true)}
          >
            <div
              className={`px-8 py-4 rounded-xl border-2 border-iron-neon-blue/80 bg-iron-neon-blue/10 backdrop-blur-md ${stampDone ? "stamp-glow" : ""}`}
            >
              <span className="font-display font-bold text-xl sm:text-2xl tracking-[0.18em] text-iron-neon-blue">
                {t("home.verified.stamp")}
              </span>
              <p className="text-xs tracking-widest text-iron-neon-blue/60 font-mono text-center mt-1 uppercase">
                Iron-ID · Cryptographic Proof
              </p>
            </div>
          </motion.div>

          {/* Exhibit label — bottom-left */}
          <motion.div
            className="absolute bottom-4 left-4 pointer-events-none"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <p className="text-[10px] font-mono text-iron-muted/70 tracking-widest uppercase">
              Original · 2025 · Watermark Applied
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Hero text ──────────────────────────────────── */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 leading-[1.08]">
          <span className="text-iron-white">{t("home.hero.art.title").split(" ").slice(0, -3).join(" ")} </span>
          <span className="text-gradient-blue">{t("home.hero.art.title").split(" ").slice(-3).join(" ")}</span>
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

/* ────────────────────────────────────────────────────────
   TAGLINE — centred italic quote
──────────────────────────────────────────────────────── */
function TaglineSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className="py-16 sm:py-24 px-page relative grain overflow-hidden">
      <div className="absolute inset-0 spotlight-purple opacity-60 pointer-events-none" />
      <motion.p
        className="font-display text-2xl sm:text-3xl md:text-4xl font-medium text-center max-w-3xl mx-auto italic leading-snug"
        style={{ color: "rgba(248,250,252,0.92)" }}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        &ldquo;{t("home.tagline")}&rdquo;
      </motion.p>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   ARTIST SHOWCASE — museum exhibit cards
──────────────────────────────────────────────────────── */
function ArtistShowcaseSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const exhibits = useMemo(
    () => [
      {
        id: 1,
        gradient: "bg-art-1",
        title: "Untitled No. 1",
        artist: "Ana M. · 2025",
        meta: "C2PA · Watermark · Verified",
        num: "01",
      },
      {
        id: 2,
        gradient: "bg-art-2",
        title: "Untitled No. 2",
        artist: "Dev R. · 2025",
        meta: "Signature verified · Tamper-proof",
        num: "02",
      },
      {
        id: 3,
        gradient: "bg-art-3",
        title: "Untitled No. 3",
        artist: "Sofia K. · 2025",
        meta: "Authentic · AI-protected",
        num: "03",
      },
    ],
    []
  );

  return (
    <section ref={ref} className="py-section px-page relative">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }}
        aria-hidden="true"
      />
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-iron-white text-center mb-3"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {t("home.showcase.title")}
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {t("home.showcase.subtitle")}
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {exhibits.map((ex, i) => (
            <motion.div
              key={ex.id}
              className="group exhibit-frame cursor-default"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Artwork area — overflow hidden clips the zoom effect */}
              <div className={`aspect-[4/5] ${ex.gradient} relative overflow-hidden`}>
                {/* Inner ambient light */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 50% at 40% 30%, rgba(255,255,255,0.04) 0%, transparent 70%)",
                  }}
                />

                {/* Museum corner brackets (always visible, glow on hover) */}
                <MuseumCorners color="rgba(59,130,246,0.3)" />

                {/* Artwork zoom layer (sits behind overlays) */}
                <motion.div
                  className={`absolute inset-0 ${ex.gradient}`}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Hover metadata overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-iron-black/95 via-iron-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                  {/* Exhibit number */}
                  <p className="font-mono text-[10px] text-iron-neon-blue/70 tracking-[0.3em] uppercase mb-2">
                    Exhibit · {ex.num}
                  </p>
                  <p className="font-display font-semibold text-lg text-iron-white leading-tight">{ex.title}</p>
                  <p className="text-xs text-iron-muted mt-0.5">{ex.artist}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-iron-neon-blue/40" />
                    <p className="text-[10px] text-iron-neon-blue font-mono tracking-wide">{ex.meta}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   COMPARISON — original / AI / verified
──────────────────────────────────────────────────────── */
function ComparisonSection() {
  const { t } = useI18n();
  const [slide, setSlide] = useState<0 | 1 | 2>(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const labels = [t("home.comparison.original"), t("home.comparison.manipulated"), t("home.comparison.verified")];

  const stateColors = ["border-white/20", "border-red-500/50", "border-iron-neon-blue/60"];
  const stateGlow = ["", "0 0 40px rgba(239,68,68,0.15)", "0 0 50px rgba(59,130,246,0.2)"];

  return (
    <section id="comparison" ref={ref} className="py-section px-page relative grain">
      {/* Section divider glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)" }}
        aria-hidden="true"
      />
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-iron-white text-center mb-3"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {t("home.comparison.title")}
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {t("home.comparison.subtitle")}
        </motion.p>

        {/* State selector */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {([0, 1, 2] as const).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                slide === i
                  ? i === 0
                    ? "bg-white/10 text-iron-white border-white/30"
                    : i === 1
                    ? "bg-red-500/15 text-red-300 border-red-500/40"
                    : "bg-iron-neon-blue/15 text-iron-neon-blue border-iron-neon-blue/40"
                  : "bg-white/[0.04] text-iron-muted border-white/10 hover:bg-white/[0.08] hover:text-iron-white"
              }`}
            >
              {labels[i]}
            </button>
          ))}
        </div>

        {/* Comparison frame */}
        <motion.div
          className={`relative aspect-video rounded-2xl overflow-hidden border shadow-exhibit transition-all duration-500 ${stateColors[slide]}`}
          style={{ boxShadow: stateGlow[slide] || undefined }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Base artwork */}
          <div className="absolute inset-0 bg-art-hero" />

          <AnimatePresence mode="wait">
            {slide === 0 && (
              <motion.div
                key="original"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse 70% 70% at 40% 40%, rgba(30,58,95,0.5) 0%, transparent 70%)",
                  }}
                />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 backdrop-blur-sm">
                  <p className="text-xs font-mono text-iron-white/80 tracking-widest uppercase">
                    Original · Unmodified
                  </p>
                </div>
                <MuseumCorners color="rgba(255,255,255,0.3)" />
              </motion.div>
            )}

            {slide === 1 && (
              <motion.div
                key="ai"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Colour distortion */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(120,0,0,0.25) 0%, transparent 50%, rgba(0,40,80,0.2) 100%)",
                    mixBlendMode: "overlay",
                  }}
                />
                {/* Horizontal glitch lines */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,0,80,0.04) 3px, rgba(255,0,80,0.04) 4px)",
                  }}
                />
                <div className="absolute top-6 right-6 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/45 backdrop-blur-sm">
                  <p className="text-xs font-mono text-red-300 tracking-widest uppercase">
                    ⚠ AI Modified
                  </p>
                </div>
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 backdrop-blur-sm">
                  <p className="text-xs font-mono text-red-400/80 tracking-wide">
                    Deepfake detected · Authenticity compromised
                  </p>
                </div>
                <MuseumCorners color="rgba(239,68,68,0.5)" />
              </motion.div>
            )}

            {slide === 2 && (
              <motion.div
                key="verified"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="px-8 py-4 rounded-xl border-2 border-iron-neon-blue/80 bg-iron-neon-blue/10 backdrop-blur-md stamp-glow"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <span className="font-display font-bold text-xl tracking-[0.18em] text-iron-neon-blue">
                      {t("home.verified.stamp")}
                    </span>
                    <p className="text-[10px] tracking-widest text-iron-neon-blue/60 font-mono text-center mt-1 uppercase">
                      Iron-ID · Cryptographic Proof
                    </p>
                  </motion.div>
                </div>
                <MuseumCorners color="rgba(59,130,246,0.55)" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   FEATURES — floating glass panels
──────────────────────────────────────────────────────── */
function FeaturesSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 0.4], [0, 35]);
  const y2 = useTransform(scrollYProgress, [0, 0.45], [0, -25]);
  const y3 = useTransform(scrollYProgress, [0, 0.4], [0, 30]);

  const features = [
    {
      key: "authenticity",
      title: t("home.features.authenticity"),
      desc: t("home.feature1.desc"),
      y: y1,
      color: "rgba(59,130,246,0.75)",
      glowColor: "rgba(59,130,246,0.2)",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      key: "detection",
      title: t("home.features.detection"),
      desc: t("home.feature2.desc"),
      y: y2,
      color: "rgba(139,92,246,0.75)",
      glowColor: "rgba(139,92,246,0.2)",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "signature",
      title: t("home.features.signature"),
      desc: t("home.feature3.desc"),
      y: y3,
      color: "rgba(59,130,246,0.75)",
      glowColor: "rgba(59,130,246,0.2)",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="technology" ref={ref} className="py-section px-page relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 spotlight opacity-50 pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-iron-white text-center mb-4"
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {t("home.section.features.title")}
        </motion.h2>
        <motion.p
          className="text-iron-muted text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {t("home.section.features.subtitle")}
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              className="glass-panel group"
              style={{ y: f.y }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 * i }}
            >
              {/* Animated icon container */}
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative animate-float"
                style={{
                  backgroundColor: f.glowColor,
                  color: f.color,
                  boxShadow: `0 0 0 1px ${f.glowColor}`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${4 + i * 0.7}s`,
                }}
                whileHover={{ scale: 1.08, rotate: 3 }}
              >
                {f.icon}
              </motion.div>

              <h3 className="font-display font-semibold text-xl text-iron-white mb-3">{f.title}</h3>
              <p className="text-iron-muted leading-relaxed text-sm">{f.desc}</p>

              {/* Bottom accent line */}
              <div
                className="mt-5 h-px w-10 transition-all duration-500 group-hover:w-full"
                style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   FINAL CTA
──────────────────────────────────────────────────────── */
function FinalCTASection() {
  const { t } = useI18n();
  return (
    <section className="py-section px-page relative grain overflow-hidden">
      <div className="absolute inset-0 spotlight opacity-40 pointer-events-none" />
      <motion.div
        className="max-w-4xl mx-auto glass rounded-3xl p-12 sm:p-20 text-center border border-white/10 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Background mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-80 pointer-events-none" />
        {/* Spotlight overlay */}
        <div className="absolute inset-0 spotlight opacity-60 pointer-events-none" />
        {/* Horizontal top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <p className="font-display text-xl sm:text-2xl text-iron-white/90 mb-5 italic">
            &ldquo;{t("home.tagline")}&rdquo;
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-iron-white mb-6">
            {t("home.section.cta.title")}
          </h2>
          <p className="text-iron-muted mb-10 max-w-xl mx-auto leading-relaxed">{t("home.section.cta.subtitle")}</p>
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

/* ────────────────────────────────────────────────────────
   Page root
──────────────────────────────────────────────────────── */
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
