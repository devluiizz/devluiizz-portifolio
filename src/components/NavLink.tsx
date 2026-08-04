"use client";

import { useSound } from "@/lib/sound";

interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
}

export function NavLink({ href, label, active }: NavLinkProps) {
  const { play } = useSound();

  return (
    <a
      href={href}
      onClick={() => play("tick")}
      aria-current={active ? "true" : undefined}
      className="group relative inline-block h-6 overflow-hidden py-0 text-sm font-medium text-text-muted transition-colors hover:text-text focus-visible:text-text data-[active=true]:text-accent"
      data-active={active}
    >
      <span className="block leading-6 transition-transform duration-300 ease-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="font-display absolute inset-0 block translate-y-full text-sm leading-6 italic text-accent transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {label}
      </span>
    </a>
  );
}
