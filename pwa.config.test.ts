import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pwaConfig } from "./pwa.config.ts";

describe("PWA build configuration", () => {
  it.each(["https://example.test/", "https://example.test/apps/cards/"])(
    "keeps installation and navigation within %s",
    (base) => {
      const manifestUrl = new URL(pwaConfig.manifestFilename, base);
      expect(new URL(pwaConfig.manifest.start_url, manifestUrl).href).toBe(
        base,
      );
      expect(new URL(pwaConfig.manifest.scope, manifestUrl).href).toBe(base);
      expect(new URL(pwaConfig.scope, base).href).toBe(base);
      expect(new URL(pwaConfig.workbox.navigateFallback, base).href).toBe(
        `${base}index.html`,
      );
    },
  );

  it("supplies the icons declared to installed applications", async () => {
    const icons = pwaConfig.manifest.icons;
    expect(icons.some((icon) => icon.sizes === "192x192")).toBe(true);
    expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    for (const icon of icons) {
      expect(icon.src).not.toMatch(/^(?:[a-z]+:|\/)|\.\./i);
      await expect(
        access(resolve("public", icon.src)),
      ).resolves.toBeUndefined();
    }
  });

  it("preserves explicit user confirmation before activating an update", () => {
    expect(pwaConfig.strategies).toBe("generateSW");
    expect(pwaConfig.registerType).toBe("prompt");
    expect(pwaConfig.workbox.skipWaiting).toBe(false);
    expect(pwaConfig.workbox.clientsClaim).toBe(false);
    expect(pwaConfig.workbox.cleanupOutdatedCaches).toBe(true);
  });
});
