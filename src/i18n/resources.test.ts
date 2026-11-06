import { describe, expect, it } from "vitest";
import { CARD_CATEGORIES } from "../lib/cards";
import { categoryLabel } from "../lib/categories";
import { STORE_PRESETS } from "../lib/stores";
import { createAppI18n } from "./index";
import { translations } from "./translations";

const sources = import.meta.glob<string>("../**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("translation resource coverage", () => {
  it("keeps all texts in a flat dictionary with lowercase dot-and-hyphen keys", () => {
    for (const [key, value] of Object.entries(translations)) {
      expect(key).toMatch(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/);
      expect(typeof value, key).toBe("string");
      expect(value.length, key).toBeGreaterThan(0);
    }
  });

  it("resolves dynamic store, format and category keys", () => {
    const i18n = createAppI18n();
    for (const store of STORE_PRESETS) {
      expect(i18n.exists(`editor.stores.${store.id}`)).toBe(true);
    }
    for (const format of ["CODE128", "EAN13", "QR"]) {
      for (const section of ["formats", "hints"]) {
        expect(i18n.exists(`editor.${section}.${format.toLowerCase()}`)).toBe(
          true,
        );
      }
    }
    for (const category of CARD_CATEGORIES) {
      expect(categoryLabel(category, i18n.t)).toBe(category);
    }
  });

  it("resolves every statically named translation used by application sources", () => {
    const i18n = createAppI18n();
    const missing: string[] = [];
    for (const [path, source] of Object.entries(sources)) {
      if (path.includes(".test.") || path.endsWith("/i18n/translations.ts"))
        continue;
      const keys = source.matchAll(
        /["'`]((?:common|errors|components|pages|editor)\.[a-zA-Z][a-zA-Z0-9_.-]*)["'`]/g,
      );
      for (const [, key] of keys) {
        // Plural base keys resolve only when an explicit count is supplied.
        if (!i18n.exists(key, { count: 1 })) missing.push(`${path}: ${key}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
