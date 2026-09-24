"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({ duration: 1.6, smoothWheel: true, wheelMultiplier: 1.5 });
    const raf = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // The mobile menu and the lightbox lock scrolling via body overflow, which does not
    // block programmatic scrolling, so Lenis has to be paused while the lock is active.
    const syncLock = () => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    syncLock();

    return () => {
      observer.disconnect();
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  return null;
}
