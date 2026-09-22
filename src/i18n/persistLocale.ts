import { LOCALE_COOKIE, type Locale } from "./routing";

// Mirrors the cookie next-intl's proxy sets, for navigations the client router
// serves from its cache without reaching the proxy.
export function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE.name}=${locale}; path=/; max-age=${LOCALE_COOKIE.maxAge}; samesite=lax`;
}
