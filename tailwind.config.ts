import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette — "Ink & Steel"
        canvas: "#0A0F1E",
        surface: "#111827",
        "surface-2": "#1A2235",
        border: "#1F2D45",
        "border-light": "#2A3A55",
        teal: {
          DEFAULT: "#00C9A7",
          dim: "#00A88A",
          muted: "rgba(0,201,167,0.12)",
        },
        text: {
          primary: "#E5E7EB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
          inverse: "#0A0F1E",
        },
        // Confidence colors
        verified: "#00C9A7",
        reported: "#F59E0B",
        estimated: "#F87171",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-sm": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      backgroundImage: {
        "gradient-teal": "linear-gradient(135deg, #00C9A7 0%, #00A88A 100%)",
        "gradient-canvas": "linear-gradient(180deg, #0A0F1E 0%, #111827 100%)",
        "gradient-radial-teal":
          "radial-gradient(ellipse 800px 400px at 50% -100px, rgba(0,201,167,0.08) 0%, transparent 70%)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(31,45,69,0.8)",
        "card-hover": "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,201,167,0.3)",
        teal: "0 0 20px rgba(0,201,167,0.15)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.4s ease-out both",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
