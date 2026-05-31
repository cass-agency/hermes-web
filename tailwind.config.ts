import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0608",
        gold: "#c9a84c",
        "gold-dim": "#8a6a2a",
        surface: "#160f13",
        "surface-2": "#1f1520",
        border: "#2a1f28",
      },
      fontFamily: {
        serif: ['"IM Fell English"', "Georgia", "serif"],
        display: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
