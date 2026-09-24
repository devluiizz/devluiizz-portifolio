import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/content/site";
import { routing } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-url";
import { ThemeInitScript, ThemeProvider } from "@/lib/theme";
import { SoundProvider } from "@/lib/sound";
import { CustomCursor } from "@/components/CustomCursor";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import "../globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale });

  return {
    metadataBase: getSiteUrl(),
    ...buildPageMetadata({
      locale,
      href: "/",
      title: t("metadata.title", { name: siteConfig.name, role: t("profile.role") }),
      description: t("profile.positioning"),
    }),
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale}
      className={`${syne.variable} ${ibmPlexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col">
        <SmoothScroll />
        <AmbientBackground />
        <ScrollProgress />
        <a
          href="#main-content"
          className="sr-only rounded-full bg-accent px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
        <ThemeProvider>
          <SoundProvider>
            <CustomCursor />
            {children}
          </SoundProvider>
        </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
