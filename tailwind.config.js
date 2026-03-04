/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
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
      },
      transitionDuration: {
        150: "150ms",
      },
    },
  },
  plugins: [],
};
