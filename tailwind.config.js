export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(28, 25, 23, 0.08), 0 8px 24px -12px rgba(28, 25, 23, 0.12)",
        card: "0 1px 0 rgba(28, 25, 23, 0.06), 0 12px 40px -16px rgba(28, 25, 23, 0.15)",
        glow: "0 0 40px -10px rgba(139, 92, 246, 0.45), 0 0 60px -20px rgba(236, 72, 153, 0.25)",
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}