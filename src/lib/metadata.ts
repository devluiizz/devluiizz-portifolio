import type { Metadata } from "next";
import { siteConfig } from "@/content/site";
import { getPathname } from "@/i18n/navigation";
import { OPEN_GRAPH_LOCALES, routing, type Locale } from "@/i18n/routing";

interface PageMetadataOptions {
  locale: Locale;
  href: string;
  title: string;
  description: string;
}

// Page-level openGraph replaces the layout's instead of merging, so every page
// builds the full set (canonical, hreflang, Open Graph, Twitter) here.
export function buildPageMetadata({
  locale,
  href,
  title,
  description,
}: PageMetadataOptions): Metadata {
  const pathFor = (target: Locale) => getPathname({ href, locale: target });

  return {
    title,
    description,
    alternates: {
      canonical: pathFor(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((target) => [target, pathFor(target)])),
        "x-default": pathFor(routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      url: pathFor(locale),
      siteName: siteConfig.name,
      title,
      description,
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: routing.locales
        .filter((target) => target !== locale)
        .map((target) => OPEN_GRAPH_LOCALES[target]),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
