"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { navItems, siteConfig } from "@/content/site";
import { Link, usePathname } from "@/i18n/navigation";
import { NavLink } from "./NavLink";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TerminalIcon } from "./TerminalIcon";

export function Header() {
  const t = useTranslations("header");
  const tNav = useTranslations("navigation");
  const pathname = usePathname();
  const [activeHref, setActiveHref] = useState<string>(navItems[0]?.href ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === "/" ? activeHref === href : pathname === href;

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = navItems
      .filter((item) => item.href.startsWith("/#"))
      .map((item) => document.getElementById(item.href.slice(2)))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`/#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/#home"
          className="font-display text-lg font-medium tracking-tight text-text"
        >
          {siteConfig.name}
        </Link>

        <nav
          aria-label={t("primaryNav")}
          className="hidden items-center gap-8 lg:flex"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={tNav(item.key)}
              active={isActive(item.href)}
              icon={
                item.key === "terminal" ? <TerminalIcon className="h-3.5 w-3.5" /> : undefined
              }
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 lg:flex">
            <SoundToggle />
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text lg:hidden"
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
          className="flex flex-col gap-1 border-t border-border bg-bg px-6 py-4 lg:hidden"
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? (item.href.startsWith("/#") ? "true" : "page") : undefined}
                data-active={active}
                className="flex items-center gap-2 rounded-md px-2 py-3 text-base font-medium text-text-muted transition-colors hover:bg-card hover:text-text data-[active=true]:text-accent"
              >
                {item.key === "terminal" && <TerminalIcon className="h-4 w-4" />}
                {tNav(item.key)}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center gap-2 border-t border-border pt-4">
            <SoundToggle />
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
