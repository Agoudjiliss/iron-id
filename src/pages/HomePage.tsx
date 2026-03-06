import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useI18n } from "../i18n";

/* ────────────────────────────────────────────────────────
   Animated mesh-gradient nebula background
──────────────────────────────────────────────────────── */
function MeshGradientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
      {/* Charcoal base */}
      <div className="absolute inset-0" style={{ background: "#050505" }} />
      {/* Blob 1 — midnight blue */}
      <div
        className="mesh-blob-1 absolute rounded-full"
        style={{
          width: "80vw", height: "80vw",
          top: "-20vw", left: "-15vw",
          background: "radial-gradient(ellipse at center, rgba(10,20,60,0.55) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />
      {/* Blob 2 — deep purple */}
      <div
        className="mesh-blob-2 absolute rounded-full"
        style={{
          width: "70vw", height: "70vw",
          bottom: "-15vw", right: "-10vw",
          background: "radial-gradient(ellipse at center, rgba(30,8,60,0.5) 0%, transparent 70%)",
          filter: "blur(56px)",
        }}
      />
      {/* Blob 3 — neon blue accent */}
      <div
        className="mesh-blob-3 absolute rounded-full"
        style={{
          width: "50vw", height: "50vw",
          top: "35%", left: "25%",
          background: "radial-gradient(ellipse at center, rgba(20,50,100,0.28) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Magnetic cursor hook — attaches spring transform
──────────────────────────────────────────────────────── */
function useMagneticEffect(strength = 0.35) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = Math.max(rect.width, rect.height) * 1.2;
      if (dist < threshold) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const handleLeave = () => { x.set(0); y.set(0); };
    window.addEventListener("mousemove", handleMove, { passive: true });
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [x, y, strength]);

  return { ref, springX, springY };
}

/* ────────────────────────────────────────────────────────
   Mouse position hook for cursor parallax
──────────────────────────────────────────────────────── */
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

/* ────────────────────────────────────────────────────────
   Deterministic particle field (no random on render)
──────────────────────────────────────────────────────── */
const PARTICLE_DATA = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Number(((i * 137.508 + 11.5) % 100).toFixed(2)),
  y: Number(((i * 73.21 + 33.1) % 100).toFixed(2)),
  size: Number((((i * 7.33) % 2.2) + 0.4).toFixed(2)),
  duration: Number((((i * 5.7) % 22) + 12).toFixed(1)),
  delay: Number((((i * 3.14) % 9)).toFixed(1)),
  purple: i % 3 === 0,
  opacity: Number((((i * 0.17) % 0.45) + 0.25).toFixed(2)),
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
              ? `rgba(139, 92, 246, ${p.opacity})`
              : `rgba(59, 130, 246, ${p.opacity})`,
          }}
          animate={{ y: [0, -60, 0], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Floating Artifacts — small geometric decorative elements
──────────────────────────────────────────────────────── */
const ARTIFACT_DATA = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Number(((i * 53.3 + 7.1) % 90 + 5).toFixed(1)),
  y: Number(((i * 79.2 + 15.4) % 80 + 10).toFixed(1)),
  size: Number((((i * 11.7) % 18) + 8).toFixed(0)),
  duration: Number((((i * 4.9) % 10) + 7).toFixed(1)),
  delay: Number((((i * 2.77) % 6)).toFixed(1)),
  type: ["triangle", "circle", "diamond", "cross", "square"][i % 5] as string,
  opacity: Number((((i * 0.09) % 0.06) + 0.04).toFixed(2)),
  blue: i % 2 === 0,
}));

function FloatingArtifacts({ revealed = false }: { revealed?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ARTIFACT_DATA.map((a) => {
        const strokeOpacity = revealed ? Math.min(a.opacity * 4, 0.35) : a.opacity;
        const strokeColor = a.blue
          ? `rgba(59,130,246,${strokeOpacity})`
          : `rgba(139,92,246,${strokeOpacity})`;
        return (
          <motion.div
            key={a.id}
            className="absolute"
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
            animate={{ y: [0, -12, 4, -8, 0], x: [0, 4, -3, 6, 0], rotate: [0, 5, -3, 4, 0] }}
            transition={{ duration: a.duration, delay: a.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {a.type === "triangle" && (
              <svg width={a.size} height={a.size} viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 22,22 2,22" stroke={strokeColor} strokeWidth="1.5" fill="none" />
              </svg>
            )}
            {a.type === "circle" && (
              <svg width={a.size} height={a.size} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1" fill="none" />
                <circle cx="12" cy="12" r="3" stroke={a.blue ? `rgba(59,130,246,${strokeOpacity * 0.6})` : `rgba(139,92,246,${strokeOpacity * 0.6})`} strokeWidth="0.8" fill="none" />
              </svg>
            )}
            {a.type === "diamond" && (
              <svg width={a.size} height={a.size} viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 22,12 12,22 2,12" stroke={strokeColor} strokeWidth="1.2" fill="none" />
              </svg>
            )}
            {a.type === "cross" && (
              <svg width={a.size} height={a.size} viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="2" x2="12" y2="22" stroke={strokeColor} strokeWidth="1" />
                <line x1="2" y1="12" x2="22" y2="12" stroke={strokeColor} strokeWidth="1" />
              </svg>
            )}
            {a.type === "square" && (
              <svg width={a.size} height={a.size} viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" stroke={strokeColor} strokeWidth="1.2" fill="none" />
              </svg>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Renaissance Scientific Sketches — da Vinci notebook style
──────────────────────────────────────────────────────── */
function RenaissanceSketches({ revealed = false }: { revealed?: boolean }) {
  const opacity = revealed ? 0.11 : 0.03;
  const c = `rgba(147,197,253,${opacity})`;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Golden spiral construction — top right */}
      <svg className="absolute" style={{ top: "4%", right: "1%", width: "320px", height: "320px", opacity }} viewBox="0 0 320 320" fill="none">
        <circle cx="160" cy="160" r="150" stroke={c} strokeWidth="0.5" />
        <circle cx="160" cy="160" r="100" stroke={c} strokeWidth="0.5" />
        <circle cx="160" cy="160" r="60" stroke={c} strokeWidth="0.5" />
        <circle cx="160" cy="160" r="25" stroke={c} strokeWidth="0.5" />
        <line x1="10" y1="160" x2="310" y2="160" stroke={c} strokeWidth="0.4" />
        <line x1="160" y1="10" x2="160" y2="310" stroke={c} strokeWidth="0.4" />
        <line x1="54" y1="54" x2="266" y2="266" stroke={c} strokeWidth="0.3" />
        <line x1="266" y1="54" x2="54" y2="266" stroke={c} strokeWidth="0.3" />
        <line x1="60" y1="156" x2="60" y2="164" stroke={c} strokeWidth="0.5" />
        <line x1="100" y1="156" x2="100" y2="164" stroke={c} strokeWidth="0.5" />
        <line x1="200" y1="156" x2="200" y2="164" stroke={c} strokeWidth="0.5" />
        <line x1="260" y1="156" x2="260" y2="164" stroke={c} strokeWidth="0.5" />
        <text x="220" y="152" fontSize="7" fill={c} fontFamily="serif">r₁</text>
        <text x="258" y="152" fontSize="7" fill={c} fontFamily="serif">r₂</text>
      </svg>
      {/* Perspective grid — bottom left */}
      <svg className="absolute" style={{ bottom: "6%", left: "2%", width: "260px", height: "180px", opacity: opacity * 0.85 }} viewBox="0 0 260 180" fill="none">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={i * 36 + 16} y1="160" x2="130" y2="18" stroke={c} strokeWidth="0.4" />
        ))}
        {[0, 1, 2, 3].map((i) => {
          const t = i / 3;
          const x1 = 16 + t * 90;
          const x2 = 244 - t * 90;
          const y = 160 - t * 142;
          return <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke={c} strokeWidth="0.3" />;
        })}
        <text x="112" y="12" fontSize="6" fill={c} fontFamily="serif">VP</text>
      </svg>
      {/* Proportion system — left side */}
      <svg className="absolute" style={{ top: "32%", left: "0.5%", width: "190px", height: "260px", opacity: opacity * 0.9 }} viewBox="0 0 190 260" fill="none">
        <rect x="28" y="10" width="134" height="190" stroke={c} strokeWidth="0.5" />
        <circle cx="95" cy="105" r="76" stroke={c} strokeWidth="0.4" />
        <line x1="95" y1="29" x2="95" y2="200" stroke={c} strokeWidth="0.3" />
        <line x1="19" y1="105" x2="171" y2="105" stroke={c} strokeWidth="0.3" />
        <line x1="28" y1="56" x2="38" y2="56" stroke={c} strokeWidth="0.5" />
        <line x1="28" y1="105" x2="38" y2="105" stroke={c} strokeWidth="0.5" />
        <line x1="28" y1="154" x2="38" y2="154" stroke={c} strokeWidth="0.5" />
        <text x="5" y="58" fontSize="5.5" fill={c} fontFamily="serif">A</text>
        <text x="5" y="107" fontSize="5.5" fill={c} fontFamily="serif">B</text>
        <text x="5" y="156" fontSize="5.5" fill={c} fontFamily="serif">C</text>
        <text x="35" y="228" fontSize="5" fill={c} fontFamily="serif" letterSpacing="1">PROPORTIO · AUREA</text>
      </svg>
      {/* Hash grid — right side lower */}
      <svg className="absolute" style={{ top: "58%", right: "3%", width: "170px", height: "130px", opacity: opacity * 0.7 }} viewBox="0 0 170 130" fill="none">
        {[18, 56, 94, 132].map((x) => (
          <line key={`v${x}`} x1={x} y1="10" x2={x} y2="120" stroke={c} strokeWidth="0.4" />
        ))}
        {[20, 48, 76, 104].map((y) => (
          <line key={`h${y}`} x1="8" y1={y} x2="162" y2={y} stroke={c} strokeWidth="0.4" />
        ))}
        <text x="8" y="8" fontSize="5" fill={c} fontFamily="monospace" letterSpacing="0.5">0xA4F2·C9B1·7E3D</text>
        <text x="8" y="130" fontSize="5" fill={c} fontFamily="monospace" letterSpacing="0.5">SHA-256 · VERIFIED</text>
      </svg>
      {/* Harmony circles — center top */}
      <svg className="absolute" style={{ top: "12%", left: "33%", width: "150px", height: "150px", opacity: opacity * 0.65 }} viewBox="0 0 150 150" fill="none">
        <circle cx="55" cy="75" r="45" stroke={c} strokeWidth="0.4" />
        <circle cx="95" cy="75" r="45" stroke={c} strokeWidth="0.4" />
        <circle cx="75" cy="75" r="45" stroke={c} strokeWidth="0.3" strokeDasharray="2 4" />
        <line x1="30" y1="75" x2="120" y2="75" stroke={c} strokeWidth="0.3" />
      </svg>
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
   REVEAL THE TRUTH — floating interactive button
──────────────────────────────────────────────────────── */
function RevealTruthButton({ onReveal, revealed }: { onReveal: () => void; revealed: boolean }) {
  const { t } = useI18n();
  return (
    <motion.div
      className="fixed bottom-24 md:bottom-8 right-6 z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4, duration: 0.8 }}
    >
      <motion.button
        type="button"
        onClick={onReveal}
        className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-mono font-medium tracking-widest uppercase overflow-hidden transition-colors duration-500"
        style={{
          borderColor: revealed ? "rgba(59,130,246,0.7)" : "rgba(255,255,255,0.15)",
          color: revealed ? "rgba(147,197,253,0.95)" : "rgba(148,163,184,0.8)",
          background: revealed ? "rgba(59,130,246,0.12)" : "rgba(15,23,42,0.85)",
          backdropFilter: "blur(12px)",
        }}
        animate={revealed ? {
          boxShadow: ["0 0 24px rgba(59,130,246,0.3)", "0 0 40px rgba(59,130,246,0.5)", "0 0 24px rgba(59,130,246,0.3)"],
        } : { boxShadow: "none" }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label={t("home.reveal.button")}
      >
        {/* Scanning shimmer */}
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.12), transparent)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
        <svg className="w-3.5 h-3.5 shrink-0 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {revealed
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          }
        </svg>
        <span className="relative z-10">{revealed ? t("home.reveal.hint") : t("home.reveal.button")}</span>
      </motion.button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   HERO — cinematic artwork with scan + verified stamp + parallax
──────────────────────────────────────────────────────── */
function HeroSection({ revealed }: { revealed: boolean }) {
  const { t } = useI18n();
  const [stampDone, setStampDone] = useState(false);
  const mouse = useMousePosition();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 50, damping: 20 });
  const springY = useSpring(my, { stiffness: 50, damping: 20 });
  const { ref: btnRef, springX: btnX, springY: btnY } = useMagneticEffect(0.4);
  const { ref: btn2Ref, springX: btn2X, springY: btn2Y } = useMagneticEffect(0.4);

  useEffect(() => {
    mx.set((mouse.x - 0.5) * 18);
    my.set((mouse.y - 0.5) * 12);
  }, [mouse, mx, my]);

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-page overflow-hidden grain">
      {/* Deep atmospheric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-iron-deep/15 via-iron-black to-iron-black" />

      {/* Gallery ceiling spotlight with parallax */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 55%, transparent 75%)",
          x: springX,
        }}
        aria-hidden="true"
      />

      {/* Renaissance sketches */}
      <RenaissanceSketches revealed={revealed} />

      {/* Floating particles */}
      <ParticleField />

      {/* Floating artifacts */}
      <FloatingArtifacts revealed={revealed} />

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-iron-black z-[2] pointer-events-none" />

      {/* ── EDITORIAL LAYOUT: asymmetric two-column ──── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center px-4 sm:px-8">

        {/* LEFT: hero text — editorial, left-aligned */}
        <motion.div
          className="lg:pl-4 xl:pl-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mixed-typography headline */}
          <h1 className="mb-6 leading-[1.04]">
            <span
              className="block font-serif italic text-5xl sm:text-6xl md:text-7xl font-semibold"
              style={{ color: "rgba(248,250,252,0.95)", letterSpacing: "-0.01em" }}
            >
              Protégez votre
            </span>
            <span
              className="block font-serif italic text-6xl sm:text-7xl md:text-8xl font-bold text-gradient-blue"
              style={{ letterSpacing: "-0.02em" }}
            >
              art
            </span>
            <span
              className="block font-mono text-sm sm:text-base tracking-[0.22em] uppercase mt-2"
              style={{ color: "rgba(59,130,246,0.75)" }}
            >
              avec la&nbsp;
              <span className="text-iron-white/60">cryptographie</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-iron-muted max-w-lg mb-10 leading-relaxed">
            {t("home.hero.art.subtitle")}
          </p>

          {/* Mixed-type tagline */}
          <p className="mb-10 text-sm">
            <span className="font-serif italic text-iron-white/70 text-lg">Authenticité</span>
            <span className="font-mono text-iron-neon-blue/50 mx-2 text-xs">·</span>
            <span className="font-mono text-xs tracking-widest text-iron-muted/60 uppercase">Signature Cryptographique</span>
            <span className="font-mono text-iron-neon-blue/50 mx-2 text-xs">·</span>
            <span className="font-serif italic text-iron-white/70 text-lg">Narration Visuelle</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div ref={btnRef} style={{ x: btnX, y: btnY }}>
              <Link to="/protect" className="btn-primary group">
                {t("home.cta.work")}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
            <motion.div ref={btn2Ref} style={{ x: btn2X, y: btn2Y }}>
              <a href="#technology" className="btn-secondary">
                {t("home.cta.tech")}
              </a>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT: artwork frame with cursor parallax */}
        <motion.div
          className="relative w-full"
          style={{ x: springX, y: springY }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient outer glow */}
          <motion.div
            className="absolute -inset-6 rounded-3xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)" }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity }}
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
              style={{ background: "radial-gradient(ellipse 50% 60% at 30% 40%, rgba(59,130,246,0.06) 0%, transparent 60%)" }}
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
                <span className="font-serif italic font-semibold text-xl sm:text-2xl tracking-[0.08em] text-iron-neon-blue">
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

          {/* Floating badge with inverse parallax — moves faster than scroll */}
          <motion.div
            className="absolute -bottom-4 -right-4 sm:-right-8 glass rounded-xl px-4 py-2.5 border border-iron-neon-blue/25 shadow-glow-sm"
            style={{ y: useTransform(useScroll().scrollY, [0, 600], [0, -30]) }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <p className="text-[10px] font-mono text-iron-neon-blue/80 tracking-[0.25em] uppercase">C2PA · SHA-256</p>
            <p className="font-serif italic text-iron-white/80 text-sm mt-0.5">Preuve vérifiée</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   TAGLINE — editorial left-aligned italic quote
──────────────────────────────────────────────────────── */
function TaglineSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} className="py-16 sm:py-24 px-page relative grain overflow-hidden">
      <div className="absolute inset-0 spotlight-purple opacity-60 pointer-events-none" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
        {/* Left: label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="hidden lg:block"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-iron-neon-blue/50 uppercase">Manifeste</p>
          <div className="mt-3 w-12 h-px bg-iron-neon-blue/30" />
        </motion.div>
        {/* Right: quote */}
        <motion.p
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium italic leading-snug"
          style={{ color: "rgba(248,250,252,0.92)" }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          &ldquo;{t("home.tagline")}&rdquo;
        </motion.p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   ARTIST SHOWCASE — museum exhibit cards with 3D tilt
──────────────────────────────────────────────────────── */
type ExhibitItem = { id: number; gradient: string; title: string; artist: string; meta: string; num: string };

function ExhibitCard({ ex, delay }: { ex: ExhibitItem; delay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const { ref: magRef, springX: magX, springY: magY } = useMagneticEffect(0.22);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setTilt({ x: ((cy / rect.height) - 0.5) * -14, y: ((cx / rect.width) - 0.5) * 14 });
    setMousePos({ x: cx / rect.width, y: cy / rect.height });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  // Deterministic pseudo-hash for exhibit authenticity visual
  // Uses prime multipliers for good bit distribution across small ID range
  const HASH_MULTIPLIER_A = 0x3f4a9b;
  const HASH_MULTIPLIER_B = 0x7ab3c1;
  const HASH_MASK_32 = 0xffffffff;
  const HASH_MASK_24 = 0xffffff;
  const hashHex = ((ex.id * HASH_MULTIPLIER_A + 0xc2a01) & HASH_MASK_32).toString(16).toUpperCase().padStart(8, "0");
  const hashFull = `0x${hashHex}${((ex.id * HASH_MULTIPLIER_B) & HASH_MASK_24).toString(16).toUpperCase().padStart(6, "0")}`;

  return (
    <motion.div
      ref={magRef as React.RefObject<HTMLDivElement>}
      style={{ x: magX, y: magY }}
    >
      <motion.div
        ref={cardRef}
        className="group cursor-default"
        style={{ perspective: "1000px" }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="rounded-xl overflow-hidden border border-white/10 bg-iron-deep/80"
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            transformStyle: "preserve-3d",
            boxShadow: hovered
              ? "0 0 0 1px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.14), 0 30px 60px -12px rgba(0,0,0,0.7)"
              : "0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.7)",
            transition: "box-shadow 0.4s ease",
          }}
        >
          {/* Artwork area */}
          <div className={`aspect-[4/5] ${ex.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 40% 30%, rgba(255,255,255,0.04) 0%, transparent 70%)" }} />
            <MuseumCorners color={hovered ? "rgba(59,130,246,0.6)" : "rgba(59,130,246,0.3)"} />
            {/* Artwork zoom layer */}
            <motion.div
              className={`absolute inset-0 ${ex.gradient}`}
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Frame glow on hover */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 60%)" }}
                />
              )}
            </AnimatePresence>
            {/* Scan line on hover */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute top-0 bottom-0 w-16 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.2), transparent)" }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "400%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}
            </AnimatePresence>

            {/* ── LOUPE / X-RAY scanner overlay on hover ── */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute pointer-events-none rounded-full overflow-hidden border border-iron-neon-blue/60"
                  style={{
                    width: 120,
                    height: 120,
                    left: `calc(${mousePos.x * 100}% - 60px)`,
                    top: `calc(${mousePos.y * 100}% - 60px)`,
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.45), inset 0 0 30px rgba(59,130,246,0.2)",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* X-ray interior — metadata */}
                  <div className="absolute inset-0 bg-iron-deep/90 backdrop-blur-sm flex flex-col items-center justify-center gap-1 p-2">
                    <p className="font-mono text-[7px] text-iron-neon-blue/80 tracking-[0.15em] uppercase text-center leading-tight">
                      METADATA
                    </p>
                    <div className="w-8 h-px bg-iron-neon-blue/30" />
                    <p className="font-mono text-[6.5px] text-iron-neon-blue/60 text-center leading-tight">{hashFull.slice(0, 10)}</p>
                    <p className="font-mono text-[6.5px] text-iron-neon-blue/50 text-center leading-tight">{ex.meta.split(" · ")[0]}</p>
                    <p className="font-mono text-[6px] text-iron-white/30 text-center leading-tight">C2PA·SHA-256</p>
                  </div>
                  {/* Crosshair lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-iron-neon-blue/20" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-iron-neon-blue/20" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover metadata overlay (bottom gradient) */}
            <div className="absolute inset-0 bg-gradient-to-t from-iron-black/95 via-iron-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
              <p className="font-mono text-[10px] text-iron-neon-blue/70 tracking-[0.3em] uppercase mb-2">Exhibit · {ex.num}</p>
              <p className="font-serif italic font-semibold text-lg text-iron-white leading-tight">{ex.title}</p>
              <p className="font-mono text-[10px] text-iron-muted mt-0.5 tracking-wide">{ex.artist}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-iron-neon-blue/40" />
                <p className="text-[10px] text-iron-neon-blue font-mono tracking-wide">{ex.meta}</p>
              </div>
              <p className="text-[9px] font-mono text-iron-neon-blue/45 mt-1.5 tracking-wider">{hashFull.slice(0, 16)} · Iron-ID</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ArtistShowcaseSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const exhibits = useMemo(
    () => [
      { id: 1, gradient: "bg-art-1", title: "Untitled No. 1", artist: "Ana M. · 2025", meta: "C2PA · Watermark · Verified", num: "01" },
      { id: 2, gradient: "bg-art-2", title: "Untitled No. 2", artist: "Dev R. · 2025", meta: "Signature verified · Tamper-proof", num: "02" },
      { id: 3, gradient: "bg-art-3", title: "Untitled No. 3", artist: "Sofia K. · 2025", meta: "Authentic · AI-protected", num: "03" },
    ],
    []
  );

  return (
    <section ref={ref} className="py-section px-page relative">
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }} aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        {/* Editorial asymmetric header — text right-aligned */}
        <div className="mb-14 flex flex-col items-end text-right">
          <motion.p
            className="font-mono text-xs tracking-[0.3em] text-iron-neon-blue/50 uppercase mb-2"
            initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}
          >
            Galerie · {exhibits.length} œuvres
          </motion.p>
          <motion.h2
            className="font-serif italic text-4xl sm:text-5xl md:text-6xl font-semibold text-iron-white max-w-xl leading-tight"
            initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.05 }}
          >
            {t("home.showcase.title")}
          </motion.h2>
          <motion.p
            className="text-iron-muted mt-3 max-w-sm"
            initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t("home.showcase.subtitle")}
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {exhibits.map((ex, i) => (
            <ExhibitCard key={ex.id} ex={ex} delay={0.15 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   AI CORRUPTION ANIMATION — cinematic sequence
──────────────────────────────────────────────────────── */
function AICorruptionSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  const phaseLabels = [t("home.corruption.original"), t("home.corruption.distorted"), t("home.corruption.restored")];
  const phaseColors = ["rgba(255,255,255,0.15)", "rgba(239,68,68,0.4)", "rgba(59,130,246,0.5)"];

  return (
    <section ref={ref} className="py-section px-page relative grain overflow-hidden">
      <div className="absolute inset-0 spotlight-purple opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)" }} aria-hidden="true" />
      <div className="max-w-5xl mx-auto">
        <motion.h2 className="font-display text-3xl sm:text-4xl font-bold text-iron-white text-center mb-3" initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          {t("home.corruption.title")}
        </motion.h2>
        <motion.p className="text-iron-muted text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
          {t("home.corruption.subtitle")}
        </motion.p>
        {/* Phase selector */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {([0, 1, 2] as const).map((i) => {
            const phaseTextColors = ["rgb(248,250,252)", "rgb(252,165,165)", "rgb(147,197,253)"];
            const phaseBgColors = ["rgba(255,255,255,0.04)", "rgba(239,68,68,0.08)", "rgba(59,130,246,0.08)"];
            const isActive = phase === i;
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => setPhase(i)}
                className="px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase border transition-all duration-300"
                style={{
                  borderColor: isActive ? phaseColors[i] : "rgba(255,255,255,0.08)",
                  color: isActive ? phaseTextColors[i] : "rgba(148,163,184,0.7)",
                  background: isActive ? phaseBgColors[i] : "transparent",
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="mr-2 opacity-60">{String(i + 1).padStart(2, "0")}</span>
                {phaseLabels[i]}
              </motion.button>
            );
          })}
        </div>
        {/* Animation frame */}
        <motion.div
          className="relative aspect-video rounded-2xl overflow-hidden border"
          style={{ borderColor: phaseColors[phase] }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-art-hero" />
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div key="original" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 40% 40%, rgba(30,58,95,0.5) 0%, transparent 70%)" }} />
                <MuseumCorners color="rgba(255,255,255,0.25)" />
                <div className="absolute bottom-5 left-5 px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/15 backdrop-blur-sm">
                  <p className="text-xs font-mono text-iron-white/80 tracking-widest uppercase">Original · Unmodified</p>
                </div>
                <motion.div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-2 h-2 rounded-full bg-white/70" />
                </motion.div>
              </motion.div>
            )}
            {phase === 1 && (
              <motion.div key="corrupted" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(120,0,0,0.3) 0%, transparent 50%, rgba(0,40,80,0.25) 100%)", mixBlendMode: "overlay" }} />
                <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,0,80,0.05) 3px, rgba(255,0,80,0.05) 4px)" }} />
                {[15, 32, 55, 72, 88].map((top, idx) => (
                  <motion.div key={idx} className="absolute h-[2px]" style={{ top: `${top}%`, left: `${10 + idx * 12}%`, width: `${20 + idx * 8}%`, background: `rgba(${idx % 2 === 0 ? "255,50,50" : "50,100,255"},0.4)` }} animate={{ x: [0, -5, 8, -3, 0], opacity: [0.8, 0.4, 0.9, 0.5, 0.8] }} transition={{ duration: 0.4, repeat: Infinity, delay: idx * 0.1 }} />
                ))}
                {[0, 1, 2].map((idx) => (
                  <motion.div key={idx} className="absolute" style={{ top: `${20 + idx * 25}%`, left: `${15 + idx * 22}%`, width: `${30 + idx * 10}%`, height: "8%", background: "rgba(255,0,80,0.06)", mixBlendMode: "screen" }} animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 0.3, repeat: Infinity, delay: idx * 0.15, repeatDelay: 0.4 }} />
                ))}
                <div className="absolute top-5 right-5 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/45 backdrop-blur-sm">
                  <p className="text-xs font-mono text-red-300 tracking-widest uppercase">⚠ AI Modified</p>
                </div>
                <div className="absolute bottom-5 left-5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 backdrop-blur-sm">
                  <p className="text-xs font-mono text-red-400/80 tracking-wide">Deepfake detected · Authenticity compromised</p>
                </div>
                <MuseumCorners color="rgba(239,68,68,0.5)" />
              </motion.div>
            )}
            {phase === 2 && (
              <motion.div key="restored" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
                <motion.div className="absolute top-0 bottom-0" style={{ width: "40%", background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.25), transparent)" }} initial={{ x: "-50%" }} animate={{ x: "200%" }} transition={{ duration: 1.4, ease: "easeInOut" }} />
                <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}>
                  <div className="px-8 py-4 rounded-xl border-2 border-iron-neon-blue/80 bg-iron-neon-blue/10 backdrop-blur-md stamp-glow">
                    <span className="font-display font-bold text-xl tracking-[0.18em] text-iron-neon-blue">{t("home.verified.stamp")}</span>
                    <p className="text-[10px] tracking-widest text-iron-neon-blue/60 font-mono text-center mt-1 uppercase">Iron-ID · Cryptographic Proof</p>
                  </div>
                </motion.div>
                <MuseumCorners color="rgba(59,130,246,0.6)" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
   FEATURES — floating glass panels with editorial header
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
      titleSerif: "Authenticité",
      desc: t("home.feature1.desc"),
      y: y1,
      color: "rgba(59,130,246,0.75)",
      glowColor: "rgba(59,130,246,0.2)",
      monoTag: "C2PA · SHA-256",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      key: "detection",
      title: t("home.features.detection"),
      titleSerif: "Détection",
      desc: t("home.feature2.desc"),
      y: y2,
      color: "rgba(139,92,246,0.75)",
      glowColor: "rgba(139,92,246,0.2)",
      monoTag: "DeepFake · AI-Proof",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: "signature",
      title: t("home.features.signature"),
      titleSerif: "Signature",
      desc: t("home.feature3.desc"),
      y: y3,
      color: "rgba(59,130,246,0.75)",
      glowColor: "rgba(59,130,246,0.2)",
      monoTag: "ECDSA · Blockchain",
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

      <div className="max-w-7xl mx-auto">
        {/* Editorial centered header with mixed typography */}
        <div className="text-center mb-16">
          <motion.p
            className="font-mono text-xs tracking-[0.3em] text-iron-neon-blue/50 uppercase mb-3"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
          >
            Technologie
          </motion.p>
          <motion.h2
            className="font-serif italic text-4xl sm:text-5xl font-semibold text-iron-white mb-3"
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            {t("home.section.features.title")}
          </motion.h2>
          <motion.p
            className="text-iron-muted max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t("home.section.features.subtitle")}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div key={f.key} style={{ y: f.y }}>
              <FeatureCard f={f} i={i} inView={inView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Named type for feature items */
type FeatureItem = {
  key: string;
  title: string;
  titleSerif: string;
  desc: string;
  y: import("framer-motion").MotionValue<number>;
  color: string;
  glowColor: string;
  monoTag: string;
  icon: React.ReactNode;
};

function FeatureCard({ f, i, inView }: { f: FeatureItem; i: number; inView: boolean }) {
  const { ref: magRef, springX, springY } = useMagneticEffect(0.18);
  return (
    <motion.div
      ref={magRef as React.RefObject<HTMLDivElement>}
      style={{ y: springY, x: springX }}
    >
      <motion.div
        className="glass-panel group h-full"
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

        {/* Mixed-type title: serif for concept + mono for tech tag */}
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: f.color, opacity: 0.7 }}>
          {f.monoTag}
        </p>
        <h3 className="font-serif italic font-semibold text-xl text-iron-white mb-3">{f.titleSerif}</h3>
        <p className="text-iron-muted leading-relaxed text-sm">{f.desc}</p>

        {/* Bottom accent line */}
        <div
          className="mt-5 h-px w-10 transition-all duration-500 group-hover:w-full"
          style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   CONSTELLATION OF AUTHENTICITY — Canvas WebGL-like
──────────────────────────────────────────────────────── */
const CONSTELLATION_NODES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Number(((i * 41.3 + 8.7) % 88 + 6).toFixed(1)),
  y: Number(((i * 67.9 + 15.2) % 80 + 10).toFixed(1)),
  size: Number((((i * 3.7) % 3) + 3).toFixed(1)),
  delay: Number((((i * 1.9) % 5)).toFixed(1)),
  duration: Number((((i * 2.3) % 3) + 2).toFixed(1)),
  purple: i % 4 === 0,
}));

const CONSTELLATION_LINES: [number, number][] = [
  [0, 3], [3, 7], [7, 12], [12, 18], [18, 23],
  [0, 5], [5, 11], [11, 17], [17, 22],
  [1, 6], [6, 13], [13, 20],
  [2, 8], [8, 14], [14, 21],
  [4, 9], [9, 15], [15, 19],
  [0, 1], [1, 2], [2, 4],
  [18, 20], [20, 22], [22, 23],
];

/** ms between spawning each new light pulse */
const PULSE_SPAWN_INTERVAL_MS = 400;
/** maximum light pulses travelling simultaneously */
const MAX_CONCURRENT_PULSES = 8;
/** how far nodes move away from cursor (in CSS pixels, scaled by dpr) */
const REPEL_STRENGTH_MULTIPLIER = 18;

function InteractiveConstellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pulse state per line
    const pulses: { line: number; t: number; speed: number }[] = [];
    let lastPulse = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const draw = (ts: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const dpr = window.devicePixelRatio;
      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;

      ctx.clearRect(0, 0, W, H);

      // Spawn new pulses
      if (ts - lastPulse > PULSE_SPAWN_INTERVAL_MS && pulses.length < MAX_CONCURRENT_PULSES) {
        const li = Math.floor(Math.random() * CONSTELLATION_LINES.length);
        pulses.push({ line: li, t: 0, speed: 0.006 + Math.random() * 0.004 });
        lastPulse = ts;
      }

      // Compute node screen positions (with mouse repulsion)
      const nodePositions = CONSTELLATION_NODES.map((n) => {
        const nx = (n.x / 100) * W;
        const ny = (n.y / 100) * H;
        const dx = nx - mx;
        const dy = ny - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 80 * dpr;
        const repelStrength = dist < repelRadius ? ((repelRadius - dist) / repelRadius) * REPEL_STRENGTH_MULTIPLIER * dpr : 0;
        return {
          x: nx + (dist > 0 ? (dx / dist) * repelStrength : 0),
          y: ny + (dist > 0 ? (dy / dist) * repelStrength : 0),
          illuminated: dist < repelRadius * 1.5,
        };
      });

      // Draw lines
      CONSTELLATION_LINES.forEach(([a, b], idx) => {
        const pA = nodePositions[a];
        const pB = nodePositions[b];
        if (!pA || !pB) return;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        const lit = pA.illuminated || pB.illuminated;
        ctx.strokeStyle = lit ? "rgba(59,130,246,0.45)" : "rgba(59,130,246,0.12)";
        ctx.lineWidth = lit ? 1.2 * dpr : 0.6 * dpr;
        ctx.stroke();

        // Pulse along this line
        const linePulses = pulses.filter((p) => p.line === idx);
        linePulses.forEach((p) => {
          const px = pA.x + (pB.x - pA.x) * p.t;
          const py = pA.y + (pB.y - pA.y) * p.t;
          const grad = ctx.createRadialGradient(px, py, 0, px, py, 8 * dpr);
          grad.addColorStop(0, "rgba(147,197,253,0.9)");
          grad.addColorStop(1, "rgba(59,130,246,0)");
          ctx.beginPath();
          ctx.arc(px, py, 8 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      });

      // Advance pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].t += pulses[i].speed;
        if (pulses[i].t >= 1) pulses.splice(i, 1);
      }

      // Draw nodes
      nodePositions.forEach((pos, i) => {
        const n = CONSTELLATION_NODES[i];
        const r = n.size * 1.8 * dpr;
        const color = n.purple ? "139,92,246" : "59,130,246";
        const glow = pos.illuminated ? 2.2 : 1;

        // Outer ring pulse
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 2.5 * glow, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color},${pos.illuminated ? 0.35 : 0.12})`;
        ctx.lineWidth = 0.8 * dpr;
        ctx.stroke();

        // Node fill
        const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * glow);
        g.addColorStop(0, `rgba(${color},${pos.illuminated ? 1 : 0.85})`);
        g.addColorStop(1, `rgba(${color},0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * glow, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: "crosshair" }}
    />
  );
}

function ConstellationSection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-section px-page relative overflow-hidden grain">
      <div className="absolute inset-0 spotlight opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }} aria-hidden="true" />
      <div className="max-w-7xl mx-auto">
        {/* Editorial header — left-aligned */}
        <div className="mb-12">
          <motion.p
            className="font-mono text-xs tracking-[0.3em] text-iron-neon-blue/50 uppercase mb-3"
            initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}
          >
            Réseau · Vérification globale
          </motion.p>
          <motion.h2
            className="font-serif italic text-4xl sm:text-5xl font-semibold text-iron-white"
            initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
          >
            {t("home.constellation.title")}
          </motion.h2>
          <motion.p
            className="text-iron-muted mt-3 max-w-lg"
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t("home.constellation.subtitle")}
          </motion.p>
        </div>
        {/* Interactive Canvas constellation */}
        <motion.div
          className="relative w-full rounded-3xl overflow-hidden border border-white/5 bg-iron-deep/30"
          style={{ height: "400px" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
          {inView && <InteractiveConstellation />}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <motion.p
              className="text-xs font-mono text-iron-neon-blue/50 tracking-widest uppercase"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2 }}
            >
              {CONSTELLATION_NODES.length} Verified Works · Global Trust Network · Hover to interact
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   TRUTH FRAGMENT EXPERIENCE — scroll assembly
──────────────────────────────────────────────────────── */
const FRAGMENT_DATA = Array.from({ length: 16 }, (_, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    id: i,
    col,
    row,
    startX: Number((((i * 47.3 + 13) % 140) - 70).toFixed(1)),
    startY: Number((((i * 61.7 + 22) % 120) - 60).toFixed(1)),
    startRotate: Number((((i * 23.5) % 80) - 40).toFixed(1)),
    delay: Number(((i * 0.08)).toFixed(2)),
  };
});

function TruthFragmentSection() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const assemblyProgress = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);
  const sealOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const [fragPositions, setFragPositions] = useState<number[]>(FRAGMENT_DATA.map(() => 0));

  useEffect(() => {
    const unsub = assemblyProgress.onChange((v) => {
      setFragPositions(FRAGMENT_DATA.map(() => v));
    });
    return unsub;
  }, [assemblyProgress]);

  return (
    <section ref={ref} className="py-section px-page relative" style={{ minHeight: "140vh" }}>
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }} aria-hidden="true" />
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-iron-black/95 pointer-events-none" />
        <div className="absolute inset-0 spotlight opacity-20 pointer-events-none" />
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-8 px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-iron-white mb-3">{t("home.fragments.title")}</h2>
          <p className="text-iron-muted">{t("home.fragments.subtitle")}</p>
        </div>
        <div className="relative w-64 h-64 sm:w-72 sm:h-72" style={{ transformStyle: "preserve-3d" }}>
          {/* Assembled glow */}
          <motion.div
            className="absolute -inset-8 rounded-2xl pointer-events-none"
            style={{ opacity: sealOpacity, background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 70%)" }}
          />
          {FRAGMENT_DATA.map((frag, idx) => {
            const progress = fragPositions[idx] ?? 0;
            const x = frag.startX * (1 - progress);
            const y = frag.startY * (1 - progress);
            const rotate = frag.startRotate * (1 - progress);
            const opacity = Math.min(progress * 8, 1);
            return (
              <motion.div
                key={frag.id}
                className="absolute overflow-hidden"
                style={{
                  left: `${frag.col * 25}%`,
                  top: `${frag.row * 25}%`,
                  width: "25%",
                  height: "25%",
                  x,
                  y,
                  rotate,
                  opacity,
                }}
              >
                <div
                  className="w-full h-full border border-iron-neon-blue/20"
                  style={{
                    background: `radial-gradient(ellipse ${60 + frag.col * 10}% ${60 + frag.row * 10}% at ${frag.col * 25 + 50}% ${frag.row * 25 + 50}%, rgba(${frag.col % 2 === 0 ? "59,130,246" : "139,92,246"},0.4) 0%, rgba(15,23,42,0.8) 100%)`,
                  }}
                />
              </motion.div>
            );
          })}
          {/* Iron-ID seal when assembled */}
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: sealOpacity }}>
            <div className="px-5 py-2.5 rounded-xl border-2 border-iron-neon-blue/80 bg-iron-neon-blue/10 backdrop-blur-md stamp-glow">
              <span className="font-display font-bold text-sm tracking-[0.15em] text-iron-neon-blue">Iron-ID ✓</span>
            </div>
          </motion.div>
        </div>
        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 flex justify-center"
          style={{ opacity: scrollHintOpacity }}
        >
          <div className="flex flex-col items-center gap-2 text-iron-muted/50">
            <p className="text-xs font-mono tracking-widest uppercase">Scroll to assemble</p>
            <motion.svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   FINAL CTA
──────────────────────────────────────────────────────── */
function FinalCTASection({ revealed }: { revealed: boolean }) {
  const { t } = useI18n();
  const { ref: btnRef1, springX: b1x, springY: b1y } = useMagneticEffect(0.4);
  const { ref: btnRef2, springX: b2x, springY: b2y } = useMagneticEffect(0.4);
  return (
    <section className="py-section px-page relative grain overflow-hidden">
      <div className="absolute inset-0 spotlight opacity-40 pointer-events-none" />
      <RenaissanceSketches revealed={revealed} />
      <motion.div
        className="max-w-4xl mx-auto glass rounded-3xl p-12 sm:p-20 text-center border border-white/10 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-80 pointer-events-none" />
        <div className="absolute inset-0 spotlight opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }} aria-hidden="true" />
        {/* Rotating seal decorations */}
        <motion.div className="absolute top-8 right-8 w-16 h-16 rounded-full border border-iron-neon-blue/20 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
          <div className="w-10 h-10 rounded-full border border-iron-neon-blue/30" />
        </motion.div>
        <motion.div className="absolute bottom-8 left-8 w-12 h-12 rounded-full border border-iron-electric-purple/20 flex items-center justify-center" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
          <div className="w-6 h-6 rounded-full border border-iron-electric-purple/30" />
        </motion.div>
        <div className="relative z-10">
          <p className="font-serif text-xl sm:text-2xl text-iron-white/90 mb-5 italic">
            &ldquo;{t("home.tagline")}&rdquo;
          </p>
          <h2 className="font-serif italic font-semibold text-3xl sm:text-4xl md:text-5xl text-iron-white mb-4 leading-tight">
            {t("home.section.cta.title")}
          </h2>
          <p className="font-mono text-xs tracking-[0.2em] text-iron-neon-blue/60 uppercase mb-3">
            Preuve Cryptographique · Watermark · C2PA
          </p>
          <p className="text-iron-muted mb-10 max-w-xl mx-auto leading-relaxed">{t("home.section.cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div ref={btnRef1 as React.RefObject<HTMLDivElement>} style={{ x: b1x, y: b1y }}>
              <Link to="/protect" className="btn-primary">{t("home.cta.work")}</Link>
            </motion.div>
            <motion.div ref={btnRef2 as React.RefObject<HTMLDivElement>} style={{ x: b2x, y: b2y }}>
              <Link to="/verify" className="btn-secondary">{t("home.verify.cta")}</Link>
            </motion.div>
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
  const [revealed, setRevealed] = useState(false);

  const handleReveal = useCallback(() => setRevealed((prev) => !prev), []);

  useEffect(() => {
    const hash = location.hash;
    if (hash === "#technology" || hash === "#comparison") {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-iron-black relative grain-film">
      {/* Animated mesh gradient nebula background */}
      <MeshGradientBg />
      <div className="relative z-[1]">
        <HeroSection revealed={revealed} />
        <TaglineSection />
        <ArtistShowcaseSection />
        <AICorruptionSection />
        <ComparisonSection />
        <FeaturesSection />
        <ConstellationSection />
        <TruthFragmentSection />
        <FinalCTASection revealed={revealed} />
        <RevealTruthButton onReveal={handleReveal} revealed={revealed} />
      </div>
    </div>
  );
}
