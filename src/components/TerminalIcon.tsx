export function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect
        x="3"
        y="4.5"
        width="18"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m7.5 9.5 2.5 2.5-2.5 2.5M12.5 15h4"
      />
    </svg>
  );
}
