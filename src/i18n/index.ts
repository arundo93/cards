import { createInstance } from "i18next";
import { translations } from "./translations";

export const supportedLocales = ["ru"] as const;
export function normalizeLocale(locale: string): "ru" {
  const language = locale
    .trim()
    .replaceAll("_", "-")
    .split("-")[0]
    .toLowerCase();
  return supportedLocales.find((supported) => supported === language) ?? "ru";
}

export function createAppI18n(locale = "ru") {
  const instance = createInstance();
  void instance.init({
    lng: normalizeLocale(locale),
    fallbackLng: "ru",
    supportedLngs: [...supportedLocales],
    load: "languageOnly",
    initAsync: false,
    defaultNS: "translation",
    keySeparator: false,
    pluralSeparator: "-",
    ns: ["translation"],
    resources: {
      ru: { translation: translations },
    },
    interpolation: { escapeValue: false }, // React escapes text and attribute values.
    react: { useSuspense: false },
  });
  return instance;
}

export const appI18n = createAppI18n();
