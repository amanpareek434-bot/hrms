import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        ink: {
          950: "#0b0d1a",
          900: "#11142a",
          800: "#171a36",
        },
      },
      boxShadow: {
        card: "0 4px 20px -8px rgba(15, 23, 42, 0.12)",
        glow: "0 0 40px -10px rgba(139, 92, 246, 0.5)",
      },
      backgroundImage: {
        "aurora-1":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(236,72,153,0.25), transparent 60%), radial-gradient(ellipse 70% 60% at 20% 50%, rgba(34,211,238,0.20), transparent 60%)",
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-32": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
