import { defineRouting } from "next-intl/routing";

export const LOCALE_COOKIE = {
  name: "NEXT_LOCALE",
  maxAge: 60 * 60 * 24 * 365,
};

export const routing = defineRouting({
  locales: ["pt-BR", "en"],
  defaultLocale: "pt-BR",
  // The default locale keeps the existing unprefixed URLs; English lives under /en.
  localePrefix: "as-needed",
  localeCookie: LOCALE_COOKIE,
});

export type Locale = (typeof routing.locales)[number];

// Language names are shown in their own language regardless of the active locale.
export const LOCALE_NAMES: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  en: "English",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
};

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
};
