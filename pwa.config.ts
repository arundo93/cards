import type { VitePWAOptions } from "vite-plugin-pwa";
import { reportPwaBuild } from "./pwa-report.ts";

export const pwaConfig = {
  strategies: "generateSW",
  filename: "sw.js",
  manifestFilename: "manifest.webmanifest",
  minify: false, // Keep the small JSON manifest readable; SW stays production-optimized.
  scope: "./",
  integration: { beforeBuildServiceWorker: reportPwaBuild },
  registerType: "prompt",
  includeAssets: ["icon.svg", "apple-touch-icon.png"],
  manifest: {
    name: "discount cards",
    short_name: "discount cards",
    description: "Ваши карты всегда рядом, даже без интернета",
    lang: "ru",
    theme_color: "#f6f5f1",
    background_color: "#f6f5f1",
    display: "standalone",
    start_url: "./",
    scope: "./",
    icons: [
      { src: "icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    navigateFallback: "index.html",
    cleanupOutdatedCaches: true,
    skipWaiting: false, // Updates remain behind the existing user confirmation.
    clientsClaim: false,
    globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
    maximumFileSizeToCacheInBytes: 4000000,
  },
} satisfies Partial<VitePWAOptions>;
