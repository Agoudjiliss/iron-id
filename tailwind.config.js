/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        iron: {
          black: "#050505",
          bg: "#050505",
          deep: "#0F172A",
          surface: "#0A0D12",
          primary: "#3B82F6",
          "neon-blue": "#3B82F6",
          "electric-purple": "#8B5CF6",
          white: "#F8FAFC",
          muted: "#94A3B8",
          border: "rgba(255,255,255,0.06)",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#93c5fd",
          400: "#3B82F6",
          500: "#3B82F6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
        },
        surface: { DEFAULT: "var(--surface)", elevated: "var(--surface-elevated)", muted: "var(--surface-muted)" },
        ink: { DEFAULT: "var(--ink)", muted: "var(--ink-muted)", subtle: "var(--ink-subtle)" },
      },
      spacing: { page: "clamp(1rem, 4vw, 2rem)", section: "clamp(3rem, 8vw, 6rem)" },
      maxWidth: { content: "clamp(40rem, 88vw, 80rem)", form: "clamp(20rem, 90vw, 32rem)" },
      minHeight: { touch: "48px" },
      minWidth: { touch: "48px" },
      borderRadius: { card: "0.75rem", button: "9999px", input: "0.5rem", frame: "0.5rem" },
      boxShadow: {
        glow: "0 0 60px rgba(59, 130, 246, 0.15)",
        "glow-purple": "0 0 60px rgba(139, 92, 246, 0.2)",
        "exhibit": "0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.5)",
        "spotlight": "0 0 120px 60px rgba(59, 130, 246, 0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 50%, rgba(139,92,246,0.04) 100%)",
        "art-1": "linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #312e81 100%)",
        "art-2": "linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #4c1d95 100%)",
        "art-3": "linear-gradient(225deg, #0f172a 0%, #1e3a5f 50%, #581c87 100%)",
      },
      animation: {
        "scan-line": "scan-line 3s ease-in-out 1 forwards",
        "stamp-in": "stamp-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 2.2s forwards",
        "float": "float 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
      keyframes: {
        "scan-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
