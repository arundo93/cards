import { configure, ThemeProvider } from "@gravity-ui/uikit";
import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { appI18n, normalizeLocale } from "./i18n";
import "@fontsource-variable/inter/wght.css";
import "@gravity-ui/uikit/styles/styles.css";
import App from "./App";
import "./styles.css";
import "./theme.css";

const applyLocale = (locale: string) => {
  const language = normalizeLocale(locale);
  document.documentElement.lang = language;
  configure({ lang: language });
};
applyLocale(appI18n.language);
appI18n.on("languageChanged", applyLocale);
if (import.meta.hot)
  import.meta.hot.dispose(() => appI18n.off("languageChanged", applyLocale));

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nextProvider i18n={appI18n}>
      <ThemeProvider theme="light" rootClassName="discount-cards-theme">
        <App />
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>,
);
