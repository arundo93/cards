import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { pwaConfig } from "./pwa.config.ts";

export default defineConfig({
  base: "./",
  plugins: [react(), VitePWA(pwaConfig)],
});
