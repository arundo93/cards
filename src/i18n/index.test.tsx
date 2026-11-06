import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { categoryLabel } from "../lib/categories";
import { createAppI18n, normalizeLocale } from "./index";

describe("application localization", () => {
  it.each(["ru", "ru-RU", "RU_ru", "en-US", "", "unknown"])(
    "initializes synchronously with supported fallback for %s",
    (locale) => {
      const i18n = createAppI18n(locale);
      expect(normalizeLocale(locale)).toBe("ru");
      expect(i18n.isInitialized).toBe(true);
      expect(i18n.resolvedLanguage).toBe("ru");
      expect(i18n.t("common.close")).toBe("Закрыть");
    },
  );
  it.each([
    [0, "карт"],
    [1, "карта"],
    [2, "карты"],
    [5, "карт"],
    [11, "карт"],
    [21, "карта"],
    [22, "карты"],
    [101, "карта"],
    [1.5, "карты"],
  ])("uses Intl Russian plural rules for %s", (count, noun) => {
    const i18n = createAppI18n();
    const formatted = new Intl.NumberFormat("ru").format(Number(count));
    expect(i18n.t("common.cards", { count: Number(count) })).toBe(
      `${formatted} ${noun}`,
    );
    expect(
      i18n.t("components.backup.on-device", { count: Number(count) }),
    ).toBe(`На устройстве · ${formatted} ${noun}`);
    expect(
      i18n.t("components.backup.file-cards", { count: Number(count) }),
    ).toBe(`В файле ${formatted} ${noun}`);
  });
  it("preserves custom categories and safely interpolates untrusted React text", () => {
    const i18n = createAppI18n();
    expect(categoryLabel("Продукты", i18n.t)).toBe("Продукты");
    expect(categoryLabel("Моя категория", i18n.t)).toBe("Моя категория");
    expect(categoryLabel("__proto__", i18n.t)).toBe("__proto__");
    const text = i18n.t("components.carousel.open", {
      name: '<script>alert("x")</script>',
    });
    const html = renderToStaticMarkup(createElement("span", null, text));
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("&amp;lt;");
  });
  it("uses the built-in Intl number formatter and exposes every resource section", () => {
    const i18n = createAppI18n();
    expect(i18n.t("common.cards", { count: 12345 })).toBe(
      `${new Intl.NumberFormat("ru").format(12345)} карт`,
    );
    for (const key of [
      "common.close",
      "errors.storage-conflict",
      "components.backup.title",
      "pages.wallet.title",
      "editor.create-title",
    ]) {
      expect(i18n.exists(key), key).toBe(true);
      expect(i18n.t(key)).not.toBe(key);
    }
    for (const store of ["pyaterochka", "magnit", "lenta", "lemanapro"]) {
      expect(i18n.exists(`editor.stores.${store}`)).toBe(true);
    }
  });
});
