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
        agrola: {
          forest: "#173D30",
          "forest-dark": "#0E2920",
          "forest-light": "#215241",
          ink: "#182620",
          "ink-light": "#283931",
          canvas: "#F4F5F1",
          card: "#FFFFFF",
          cardsubtle: "#F9FAF7",
          border: "#E1E6DE",
          "border-dark": "#CBD3C7",
          lime: "#B8D96B",
          "lime-bright": "#C8E87B",
          "lime-light": "#EBF6D4",
          "lime-dark": "#7F9E38",
          amber: "#D9822B",
          "amber-light": "#FDF3E7",
          emerald: "#2D7F58",
          "emerald-light": "#E9F5EE",
          slate: "#62756E",
          muted: "#7E9088",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        "2xs": "0 1px 1px rgba(24, 38, 32, 0.04)",
        "xs": "0 1px 2px rgba(24, 38, 32, 0.06), 0 1px 1px rgba(24, 38, 32, 0.04)",
        "subtle": "0 1px 3px rgba(24, 38, 32, 0.05), 0 1px 2px rgba(24, 38, 32, 0.03)",
        "card": "0 2px 8px -2px rgba(24, 38, 32, 0.06), 0 1px 4px -1px rgba(24, 38, 32, 0.03)",
        "elevated": "0 8px 24px -4px rgba(24, 38, 32, 0.08), 0 2px 6px -2px rgba(24, 38, 32, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
