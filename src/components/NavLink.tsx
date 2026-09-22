"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useSound } from "@/lib/sound";

interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
  icon?: ReactNode;
}

export function NavLink({ href, label, active, icon }: NavLinkProps) {
  const { play } = useSound();
  const isSection = href.startsWith("/#");

  return (
    <Link
      href={href}
      onClick={() => play("tick")}
      aria-current={active ? (isSection ? "true" : "page") : undefined}
      className="group relative inline-flex h-6 items-center gap-1.5 py-0 text-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:text-text data-[active=true]:text-accent"
      data-active={active}
    >
      {icon}
      <span className="relative block h-6 overflow-hidden">
        <span className="block leading-6 transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="font-display absolute inset-0 block translate-y-full text-sm leading-6 italic text-accent transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
        >
          {label}
        </span>
      </span>
    </Link>
  );
}
