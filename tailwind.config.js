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
          bg: "#05070A",
          surface: "#0A0D12",
          border: "rgba(255,255,255,0.06)",
          "primary": "#4F8CFF",
          "secondary": "#6CF2FF",
          "glow": "#8B5CF6",
          "text": "#FFFFFF",
          "muted": "#A1A1AA",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#4F8CFF",
          600: "#4F8CFF",
          700: "#4338ca",
          800: "#3730a3",
        },
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          muted: "var(--surface-muted)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          subtle: "var(--ink-subtle)",
        },
      },
      spacing: {
        page: "clamp(1rem, 4vw, 2rem)",
        section: "clamp(2rem, 6vw, 4rem)",
      },
      maxWidth: {
        content: "clamp(40rem, 80vw, 72rem)",
        form: "clamp(20rem, 90vw, 32rem)",
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
      borderRadius: {
        card: "0.75rem",
        button: "9999px",
        input: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05)",
        cardHover: "0 4px 6px rgba(0,0,0,0.1)",
        header: "0 1px 0 rgba(0,0,0,0.05)",
        glow: "0 0 40px rgba(79, 140, 255, 0.15)",
        "glow-purple": "0 0 40px rgba(139, 92, 246, 0.15)",
        "glow-cyan": "0 0 40px rgba(108, 242, 255, 0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-mesh": "linear-gradient(135deg, rgba(79,140,255,0.03) 0%, transparent 50%, rgba(139,92,246,0.03) 100%)",
      },
      animation: {
        "scan": "scan 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%, 100%": { transform: "translateY(-100%)" },
          "50%": { transform: "translateY(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
