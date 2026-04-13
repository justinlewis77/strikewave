import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B0F1A",
        "neon-pink": "#ff0080",
        "neon-cyan": "#00f0ff",
        "neon-purple": "#9d00ff",
        "card-bg": "rgba(255,255,255,0.04)",
        "card-border": "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 12px rgba(255,0,128,0.5), 0 0 30px rgba(255,0,128,0.2)",
        cyan: "0 0 12px rgba(0,240,255,0.5), 0 0 30px rgba(0,240,255,0.2)",
        purple: "0 0 12px rgba(157,0,255,0.5), 0 0 30px rgba(157,0,255,0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
