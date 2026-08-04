"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [data-cursor-hover]';

// A single combined query avoids two independently-timed state corrections
// (fine pointer + reduced motion) racing each other through separate renders.
const CURSOR_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export function CustomCursor() {
  const active = useMediaQuery(CURSOR_QUERY);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove("cursor-ready");
      return;
    }

    document.documentElement.classList.add("cursor-ready");

    const dot = dotRef.current;
    if (!dot) return;

    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...position };
    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    const handlePointerOver = (event: PointerEvent) => {
      const isInteractive = (event.target as Element | null)?.closest(
        INTERACTIVE_SELECTOR,
      );
      dot.dataset.state = isInteractive ? "hover" : "default";
    };

    const tick = () => {
      position.x += (target.x - position.x) * 0.22;
      position.y += (target.y - position.y) * 0.22;
      dot.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerover", handlePointerOver);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("cursor-ready");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      data-state="default"
      className="pointer-events-none fixed left-0 top-0 z-[999] -ml-2 -mt-2 h-4 w-4 rounded-full border border-accent bg-accent/30 transition-[width,height,margin,background-color] duration-150 ease-out data-[state=hover]:-ml-3.5 data-[state=hover]:-mt-3.5 data-[state=hover]:h-7 data-[state=hover]:w-7 data-[state=hover]:bg-accent/20"
    />
  );
}
