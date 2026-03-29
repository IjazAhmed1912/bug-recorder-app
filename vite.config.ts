import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import autoprefixer from "autoprefixer"
import tailwindcss from "tailwindcss"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// PostCSS is wired here so Tailwind always runs (some setups skip postcss.config discovery).
export default defineConfig({
  // For GitHub Pages / subpath hosting use: base: '/your-repo-name/'
  // (import.meta.env.BASE_URL in the app + router basename follow this.)
  base: "/",
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({ config: path.join(__dirname, "tailwind.config.js") }),
        autoprefixer(),
      ],
    },
  },
})
