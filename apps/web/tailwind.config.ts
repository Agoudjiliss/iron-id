import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "iron-black":    "#0A0A0A",
        "iron-white":    "#FAFAFA",
        "iron-gold":     "#D4AF37",
        "iron-gold-dim": "#9E7F1A",
        "iron-slate":    "#1A1A2E",
        "iron-border":   "#2A2A3E",
        "iron-green":    "#00D26A",
        "iron-red":      "#FF4757",
        "iron-blue":     "#4A90E2",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-gold":      "pulse-gold 2s ease-in-out infinite",
        "fade-in":         "fade-in 0.3s ease-out",
        "slide-up":        "slide-up 0.4s ease-out",
        "marquee":         "marquee 40s linear infinite",
        "marquee-reverse": "marquee-reverse 40s linear infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212, 175, 55, 0.4)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(212, 175, 55, 0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to:   { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
