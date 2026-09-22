"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/lib/theme";
import { useSound } from "@/lib/sound";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, toggleTheme } = useTheme();
  const { play } = useSound();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        play(isDark ? "toggle-off" : "toggle-on");
        toggleTheme();
      }}
      aria-pressed={isDark}
      aria-label={isDark ? t("enableLight") : t("enableDark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.4 5.6l-1.4 1.4M7 17l-1.4 1.4M18.4 18.4L17 17M7 7 5.6 5.6"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"
          />
        </svg>
      )}
    </button>
  );
}
