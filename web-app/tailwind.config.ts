import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        "surface-sunk": "var(--color-surface-sunk)",
        overlay: "var(--color-overlay)",
        sage: {
          50: "var(--color-sage-50)",
          100: "var(--color-sage-100)",
          200: "var(--color-sage-200)",
          400: "var(--color-sage-400)",
          600: "var(--color-sage-600)",
          800: "var(--color-sage-800)",
          900: "var(--color-sage-900)",
        },
        ink: {
          900: "var(--color-ink-900)",
          700: "var(--color-ink-700)",
          500: "var(--color-ink-500)",
          300: "var(--color-ink-300)",
        },
        amber: {
          50: "var(--color-amber-50)",
          500: "var(--color-amber-500)",
          700: "var(--color-amber-700)",
        },
        status: {
          ok: "var(--color-status-ok)",
          warn: "var(--color-status-warn)",
          alert: "var(--color-status-alert)",
          info: "var(--color-status-info)",
        },
      },
      fontFamily: {
        sans: ["Poppins", "var(--font-poppins)", "SF Pro Text", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif Pro", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      spacing: {
        "4": "4px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "48": "48px",
        "64": "64px",
        "96": "96px",
        "128": "128px",
      },
    },
  },
  plugins: [],
};

export default config;
