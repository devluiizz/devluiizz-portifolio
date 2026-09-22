"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { navItems, siteConfig } from "@/content/site";
import { NavLink } from "./NavLink";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("header");
  const tNav = useTranslations("navigation");
  const [activeHref, setActiveHref] = useState(navItems[0]?.href ?? "");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#home"
          className="font-display text-lg font-medium tracking-tight text-text"
        >
          {siteConfig.name}
        </a>

        <nav
          aria-label={t("primaryNav")}
          className="hidden items-center gap-8 md:flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={tNav(item.key)}
              active={activeHref === item.href}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 md:flex">
            <SoundToggle />
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text md:hidden"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  d="M5 5l14 14M19 5 5 19"
                />
              ) : (
                <path
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label={t("mobileNav")}
          className="flex flex-col gap-1 border-t border-border bg-bg px-6 py-4 md:hidden"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-3 text-base font-medium text-text-muted transition-colors hover:bg-card hover:text-text"
            >
              {tNav(item.key)}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-border pt-4">
            <SoundToggle />
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
