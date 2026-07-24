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
        // Core brand palette — extracted from the NexByte logo, preserved exactly.
        nex: {
          black: "#05070C",       // near-black base, deeper than pure #000 for OLED depth
          ink: "#0A0E17",         // panel background
          blue: "#1E5EFF",        // primary brand blue (logo "BYTE")
          blueLight: "#4A8CFF",   // lighter accent / hover
          blueDeep: "#0B2A8C",    // deep blue for gradients
          white: "#F7F9FC",       // brand white / off-white text
          mist: "#8B93A7",        // muted secondary text
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(30,94,255,0.35), 0 0 60px rgba(30,94,255,0.15)",
        "glow-blue-lg": "0 0 40px rgba(30,94,255,0.45), 0 0 100px rgba(30,94,255,0.2)",
        "glass": "0 8px 32px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 50% 0%, rgba(30,94,255,0.18), transparent 60%)",
        "hero-radial":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(30,94,255,0.35), transparent 70%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "blur(20px)" },
          "50%": { opacity: "1", filter: "blur(28px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        marquee: "marquee 30s linear infinite",
        "scan-line": "scan-line 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
