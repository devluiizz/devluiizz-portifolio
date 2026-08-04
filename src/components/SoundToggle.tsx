"use client";

import { useSound } from "@/lib/sound";

export function SoundToggle() {
  const { enabled, toggleEnabled, play } = useSound();

  return (
    <button
      type="button"
      onClick={() => {
        const next = !enabled;
        toggleEnabled();
        if (next) window.setTimeout(() => play("tick"), 60);
      }}
      aria-pressed={enabled}
      aria-label={enabled ? "Desativar sons da interface" : "Ativar sons da interface"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {enabled ? (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            d="M4 9.5h3.2L11 6v12l-3.8-3.5H4z"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M15.2 8.8a4.5 4.5 0 0 1 0 6.4M17.8 6.2a8.2 8.2 0 0 1 0 11.6"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            d="M4 9.5h3.2L11 6v12l-3.8-3.5H4z"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="m15 9 4.5 6M19.5 9 15 15"
          />
        </svg>
      )}
    </button>
  );
}
