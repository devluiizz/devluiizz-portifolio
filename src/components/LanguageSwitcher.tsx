"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { persistLocale } from "@/i18n/persistLocale";
import { LOCALE_NAMES, LOCALE_SHORT_LABELS, routing, type Locale } from "@/i18n/routing";
import { useSound } from "@/lib/sound";

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { play } = useSound();
  const [isPending, startTransition] = useTransition();
  const activeIndex = routing.locales.indexOf(locale);

  function selectLocale(next: Locale) {
    if (next === locale) return;
    play("tick");
    persistLocale(next);
    startTransition(() => {
      router.replace(getPathname({ href: pathname, locale: next }), { scroll: false });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      aria-busy={isPending}
      className="group flex h-9 items-center rounded-full border border-border p-1 text-text-muted transition-colors hover:border-accent/60"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        aria-hidden="true"
        className="mx-1.5 hidden shrink-0 transition-transform duration-500 ease-out group-hover:rotate-[20deg] sm:block"
      >
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5M12 3.5c-2.3 2.4-3.4 5.2-3.4 8.5s1.1 6.1 3.4 8.5"
        />
      </svg>

      <div className="relative flex">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-9 rounded-full bg-accent-soft transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {routing.locales.map((option) => {
          const active = option === locale;
          return (
            <button
              key={option}
              type="button"
              lang={option}
              aria-pressed={active}
              disabled={isPending && !active}
              onClick={() => selectLocale(option)}
              className={`relative flex h-7 w-9 items-center justify-center rounded-full font-mono text-xs font-medium transition-colors ${
                active ? "text-accent" : "text-text-muted hover:text-text"
              }`}
            >
              <span aria-hidden="true">{LOCALE_SHORT_LABELS[option]}</span>
              <span className="sr-only">{LOCALE_NAMES[option]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
