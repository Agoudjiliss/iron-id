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
  const springX = useSpring(x, { stiffness: 80, damping: 25 });
  const springY = useSpring(y, { stiffness: 80, damping: 25 });

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
   SEAL OF TRUTH — SVG signature that draws on hover
──────────────────────────────────────────────────────── */
function SealOfTruth({ active }: { active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg viewBox="0 0 100 100" className="w-28 h-28" aria-hidden="true">
        {/* Outer seal circle */}
        <motion.circle
          cx="50" cy="50" r="38"
          fill="rgba(5,5,5,0.55)"
          stroke="rgba(59,130,246,0.75)"
          strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
          transition={{ duration: 1.3, ease: "easeInOut" }}
        />
        {/* Inner ring */}
        <motion.circle
          cx="50" cy="50" r="30"
          fill="none"
          stroke="rgba(59,130,246,0.35)"
          strokeWidth="0.5"
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0, rotate: active ? 360 : 0 }}
          transition={{ opacity: { duration: 0.5, delay: 0.6 }, rotate: { duration: 12, repeat: Infinity, ease: "linear" } }}
          style={{ transformOrigin: "50px 50px" }}
        />
        {/* Checkmark — draws itself */}
        <motion.path
          d="M 36 50 L 45 60 L 66 38"
          fill="none"
          stroke="rgba(147,197,253,0.95)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ duration: 0.55, delay: active ? 0.95 : 0, ease: "easeOut" }}
        />
        {/* Label */}
        <motion.text
          x="50" y="82"
          textAnchor="middle"
          fontSize="5"
          fill="rgba(59,130,246,0.75)"
          fontFamily="monospace"
          letterSpacing="0.08em"
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: active ? 1.5 : 0, duration: 0.4 }}
        >
          Iron-ID · Verified
        </motion.text>
      </svg>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────
   WAVEFORM — interactive audio visualiser
──────────────────────────────────────────────────────── */
const WAVEFORM_BARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  height: Math.abs(Math.sin(i * 0.65) * 55 + Math.sin(i * 1.4) * 25) + 8,
  delay: i * 0.018,
}));

function WaveformVisual({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center h-full gap-[2px] px-4" aria-hidden="true">
      {WAVEFORM_BARS.map((bar) => (
        <motion.div
          key={bar.id}
          className="rounded-full"
          style={{
            width: 3,
            background: "rgba(59,130,246,0.7)",
            minHeight: 4,
          }}
          animate={
            active
              ? {
                  height: [`${bar.height * 0.4}%`, `${bar.height}%`, `${bar.height * 0.55}%`],
                  opacity: [0.55, 1, 0.65],
                }
              : { height: `${bar.height * 0.25}%`, opacity: 0.3 }
          }
          transition={
            active
              ? { duration: 1.4, delay: bar.delay, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              : { duration: 0.5 }
          }
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MULTIMODAL GALLERY — Visual / Cinema / Sound
──────────────────────────────────────────────────────── */
function MultimodalCard({
  type,
  title,
  desc,
  delay,
}: {
  type: "visual" | "cinema" | "sound";
  title: string;
  desc: string;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  const gradients = {
    visual: "bg-art-1",
    cinema: "bg-art-2",
    sound: "bg-art-3",
  };

  const monoLabels = {
    visual: "C2PA · SHA-256 · Watermark",
    cinema: "Frame-hash · Signature · Proof",
    sound: "Audio-DNA · Waveform · Seal",
  };

  const typeIcons = {
    visual: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
    cinema: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.875v1.5m1.5-3.75C19.496 5.004 19 4.5 18.375 4.5m1.25 3.75h-1.5M18 7.875v1.5c0 .621.504 1.125 1.125 1.125M6 9.375v1.5m0 0c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v1.5m12-3v3" />
      </svg>
    ),
    sound: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
  };

  return (
    <motion.div
      className="group cursor-default"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className={`relative rounded-2xl overflow-hidden border border-white/10 ${gradients[type]}`}
        animate={{
          boxShadow: hovered
            ? "0 0 0 1px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.14), 0 30px 60px -12px rgba(0,0,0,0.8)"
            : "0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.7)",
        }}
        transition={{ duration: 0.5 }}
        style={{ minHeight: type === "sound" ? 260 : 320 }}
      >
        {/* Canvas texture grain */}
        <div className="absolute inset-0 canvas-texture" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-iron-black/80 via-transparent to-iron-black/30 pointer-events-none" />
        {/* Museum corners */}
        <MuseumCorners color={hovered ? "rgba(59,130,246,0.65)" : "rgba(59,130,246,0.25)"} />

        {/* Sound card — waveform in centre */}
        {type === "sound" && (
          <div className="absolute inset-0 flex items-center">
            <WaveformVisual active={hovered} />
          </div>
        )}

        {/* Cinema card — play button overlay */}
        {type === "cinema" && (
          <AnimatePresence>
            {!hovered && (
              <motion.div
                key="play"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white/70 ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Scan sweep on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="scan"
              className="absolute top-0 bottom-0 w-20 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(147,197,253,0.18), transparent)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "500%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Seal of Truth */}
        <SealOfTruth active={hovered} />

        {/* Bottom info panel */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(59,130,246,0.15)", color: "rgba(147,197,253,0.9)" }}
            >
              {typeIcons[type]}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-[0.25em] text-iron-neon-blue/60 uppercase mb-1">
                {monoLabels[type]}
              </p>
              <h3 className="font-serif italic font-semibold text-lg text-iron-white leading-tight">{title}</h3>
              <p className="text-iron-muted text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MultimodalGallerySection() {
  const { t } = useI18n();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="gallery" className="py-section px-page relative">
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.p
            className="font-mono text-xs tracking-[0.3em] text-iron-neon-blue/50 uppercase mb-3"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}
          >
            Galerie · Protection Multimodale
          </motion.p>
          <motion.h2
            className="font-serif italic text-4xl sm:text-5xl md:text-6xl font-semibold text-iron-white"
            initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
          >
            {t("home.multimodal.title")}
          </motion.h2>
          <motion.p
            className="text-iron-muted mt-3 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t("home.multimodal.subtitle")}
          </motion.p>
        </div>

        {/* 3 cards grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <MultimodalCard
            type="visual"
            title={t("home.multimodal.visual.title")}
            desc={t("home.multimodal.visual.desc")}
            delay={0}
          />
          <MultimodalCard
            type="cinema"
            title={t("home.multimodal.cinema.title")}
            desc={t("home.multimodal.cinema.desc")}
            delay={0.12}
          />
          <MultimodalCard
            type="sound"
            title={t("home.multimodal.sound.title")}
            desc={t("home.multimodal.sound.desc")}
            delay={0.24}
          />
        </div>
      </div>
    </section>
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
   CONTACT — final section
──────────────────────────────────────────────────────── */
function ContactSection({ revealed }: { revealed: boolean }) {
  const { t } = useI18n();
  const { ref: btnRef1, springX: b1x, springY: b1y } = useMagneticEffect(0.4);
  const { ref: btnRef2, springX: b2x, springY: b2y } = useMagneticEffect(0.4);
  const { ref: btnRef3, springX: b3x, springY: b3y } = useMagneticEffect(0.4);

  return (
    <section id="contact" className="py-section px-page relative grain overflow-hidden">
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
        <motion.div
          className="absolute top-8 right-8 w-16 h-16 rounded-full border border-iron-neon-blue/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-10 h-10 rounded-full border border-iron-neon-blue/30" />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-8 w-12 h-12 rounded-full border border-iron-electric-purple/20 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-6 h-6 rounded-full border border-iron-electric-purple/30" />
        </motion.div>
        <div className="relative z-10">
          <p className="font-serif text-xl sm:text-2xl text-iron-white/90 mb-5 italic">
            &ldquo;{t("home.tagline")}&rdquo;
          </p>
          <h2 className="font-serif italic font-semibold text-3xl sm:text-4xl md:text-5xl text-iron-white mb-4 leading-tight">
            {t("home.contact.title")}
          </h2>
          <p className="font-mono text-xs tracking-[0.2em] text-iron-neon-blue/60 uppercase mb-3">
            C2PA · SHA-256 · Watermark · Audio-DNA
          </p>
          <p className="text-iron-muted mb-10 max-w-xl mx-auto leading-relaxed">
            {t("home.contact.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div ref={btnRef1 as React.RefObject<HTMLDivElement>} style={{ x: b1x, y: b1y }}>
              <Link to="/protect" className="btn-primary">{t("home.cta.work")}</Link>
            </motion.div>
            <motion.div ref={btnRef2 as React.RefObject<HTMLDivElement>} style={{ x: b2x, y: b2y }}>
              <Link to="/verify" className="btn-secondary">{t("home.verify.cta")}</Link>
            </motion.div>
            <motion.div ref={btnRef3 as React.RefObject<HTMLDivElement>} style={{ x: b3x, y: b3y }}>
              <Link to="/feedback" className="btn-secondary">{t("home.contact.cta")}</Link>
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
    if (hash === "#technology" || hash === "#gallery" || hash === "#contact") {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-iron-black relative grain-film">
      {/* Animated mesh gradient nebula background */}
      <MeshGradientBg />
      <div className="relative z-[1]">
        {/* Hero */}
        <HeroSection revealed={revealed} />
        {/* Manifeste */}
        <TaglineSection />
        {/* Galerie Multimodale */}
        <MultimodalGallerySection />
        {/* Technologie */}
        <FeaturesSection />
        <ConstellationSection />
        {/* Contact */}
        <ContactSection revealed={revealed} />
        <RevealTruthButton onReveal={handleReveal} revealed={revealed} />
      </div>
    </div>
  );
}
