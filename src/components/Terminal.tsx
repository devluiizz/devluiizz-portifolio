"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/content/site";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useTheme } from "@/lib/theme";
import {
  completeInput,
  executeCommand,
  suggestCompletion,
} from "@/lib/terminal/commands";
import { sectionElementId } from "@/lib/terminal/sections";
import { initialTerminalState, terminalReducer } from "@/lib/terminal/state";
import type { TerminalEffect } from "@/lib/terminal/types";
import { PromptLabel, TerminalPrompt } from "./TerminalPrompt";
import { TerminalOutput } from "./TerminalOutput";
import { TerminalLogo } from "./TerminalLogo";
import { TerminalIcon } from "./TerminalIcon";

const BOOTED_KEY = "portfolio-terminal-booted";
const BOOT_LINES = ["init", "modules", "session"] as const;
const EXIT_DELAY_MS = 450;

const WINDOW_DOTS = [
  "bg-error hover:shadow-[0_0_10px_var(--color-error)]",
  "bg-warning hover:shadow-[0_0_10px_var(--color-warning)]",
  "bg-success hover:shadow-[0_0_10px_var(--color-success)]",
];

export function Terminal({ year }: { year: number }) {
  const t = useTranslations("terminal");
  const tNav = useTranslations("navigation");
  const tProfile = useTranslations("profile");
  const [state, dispatch] = useReducer(terminalReducer, initialTerminalState);
  const [booted, setBooted] = useState(false);
  const [instant, setInstant] = useState(false);
  const [exiting, setExiting] = useState(false);
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const exitTimerRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The boot animations stay paused until the section scrolls into view, and
  // play only once per browser session; later visits show it already booted.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOTED_KEY) !== null;
    } catch {
      // storage unavailable; the boot sequence simply plays every time
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setInstant(seen);
        setBooted(true);
        try {
          sessionStorage.setItem(BOOTED_KEY, "1");
        } catch {
          // ignore persistence failure; the sequence will replay next visit
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen || state.entries.length === 0) return;
    screen.scrollTo({
      top: screen.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [state.entries.length, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

  function scrollToSection(elementId: string) {
    document.getElementById(elementId)?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(window.history.state, "", `#${elementId}`);
  }

  function runEffect(effect: TerminalEffect) {
    switch (effect.type) {
      case "clear":
        return;
      case "theme":
        setTheme(effect.theme);
        return;
      case "navigate": {
        if (effect.section !== "terminal") inputRef.current?.blur();
        scrollToSection(sectionElementId(effect.section));
        return;
      }
      case "exit": {
        inputRef.current?.blur();
        setExiting(true);
        exitTimerRef.current = window.setTimeout(
          () => {
            exitTimerRef.current = null;
            setExiting(false);
            scrollToSection(sectionElementId("home"));
          },
          prefersReducedMotion ? 0 : EXIT_DELAY_MS,
        );
        return;
      }
    }
  }

  function handleSubmit() {
    const result = executeCommand(state.input, {
      theme,
      now: Date.now(),
      // Session = this page load; timeOrigin survives client-side locale switches.
      sessionStart: performance.timeOrigin,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    dispatch({
      type: "submit",
      output: result.output,
      clear: result.effect?.type === "clear",
    });
    if (result.effect) runEffect(result.effect);
  }

  function handleComplete(): boolean {
    const completed = completeInput(state.input);
    if (completed === null || completed === state.input) return false;
    dispatch({ type: "input", value: completed });
    return true;
  }

  function focusInput() {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section
      ref={sectionRef}
      id="terminal"
      aria-labelledby="terminal-heading"
      data-terminal={booted ? "booted" : "idle"}
      data-instant={instant || undefined}
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
        {tNav("terminal")}
      </span>
      <h2 id="terminal-heading" className="sr-only">
        {t("heading")}
      </h2>

      <div className="terminal-window relative mt-8">
        <div
          aria-hidden="true"
          className="terminal-glow absolute inset-x-10 -inset-y-2 rounded-[2rem]"
        />

        <div
          data-exiting={exiting || undefined}
          className="terminal-frame relative overflow-hidden rounded-2xl border border-terminal-line bg-terminal-bg focus-within:border-terminal-accent/45"
        >
          <div className="relative flex h-11 items-center gap-3 border-b border-terminal-line bg-terminal-bar px-4 sm:h-12 sm:px-5">
            <div aria-hidden="true" className="flex items-center gap-2">
              {WINDOW_DOTS.map((dot) => (
                <span
                  key={dot}
                  className={`h-3 w-3 rounded-full opacity-85 transition duration-200 hover:scale-110 hover:opacity-100 hover:brightness-125 ${dot}`}
                />
              ))}
            </div>

            <p className="pointer-events-none flex items-center gap-2 whitespace-nowrap font-mono text-[11px] font-medium tracking-[0.16em] text-terminal-text sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:text-xs sm:tracking-[0.22em]">
              <TerminalIcon className="hidden h-3.5 w-3.5 text-terminal-accent sm:block" />
              <span>
                BASH <span className="text-terminal-accent">{"//"}</span> DEVLUIIZZ.EXE
              </span>
            </p>

            <div
              aria-hidden="true"
              className="ml-auto flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-terminal-muted"
            >
              <span className="terminal-status-dot h-1.5 w-1.5 rounded-full bg-success" />
              <span className="hidden grid-cols-1 uppercase sm:grid">
                <span className="terminal-status-boot col-start-1 row-start-1">
                  {t("status.booting")}
                </span>
                <span className="terminal-status-ready col-start-1 row-start-1">
                  {t("status.ready")}
                </span>
              </span>
            </div>

            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-terminal-accent/50 to-transparent"
            />
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="terminal-vignette pointer-events-none absolute inset-0"
            />
            <div
              aria-hidden="true"
              className="terminal-scanlines pointer-events-none absolute inset-0 z-10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
            >
              <div className="terminal-sweep absolute inset-x-0 top-0" />
            </div>

            <div
              ref={screenRef}
              onMouseUp={focusInput}
              data-lenis-prevent
              className="terminal-screen relative h-[min(60svh,540px)] min-h-[400px] overflow-y-auto overscroll-contain px-4 py-5 font-mono text-[13px] leading-7 text-terminal-text sm:px-8 sm:py-7 sm:text-sm"
            >
              <ul className="text-[11px] leading-6 text-terminal-muted sm:text-xs">
                {BOOT_LINES.map((line, index) => (
                  <li
                    key={line}
                    className="terminal-boot flex gap-2"
                    style={{ animationDelay: `${120 + index * 130}ms` }}
                  >
                    <span aria-hidden="true" className="text-terminal-accent">
                      ›
                    </span>
                    <span>{t(`boot.${line}`)}</span>
                    <span
                      aria-hidden="true"
                      className="ml-auto hidden text-success/80 sm:inline"
                    >
                      [ ok ]
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 sm:mt-8">
                <TerminalLogo />
              </div>

              <p
                className="terminal-boot mt-5 sm:mt-6"
                style={{ animationDelay: "1250ms" }}
              >
                <span className="font-medium text-terminal-accent">
                  DEVLUIIZZ OS v2.0
                </span>
                <span className="text-terminal-muted"> - </span>
                {tProfile("role")} · {tProfile("studentNote")}
              </p>

              <div
                aria-hidden="true"
                className="terminal-boot my-4 h-px max-w-xl bg-gradient-to-r from-terminal-accent/60 via-terminal-line to-transparent"
                style={{ animationDelay: "1350ms" }}
              />

              <p
                className="terminal-boot text-terminal-muted"
                style={{ animationDelay: "1420ms" }}
              >
                {t("copyright", { year, name: siteConfig.name })}
              </p>
              <p
                className="terminal-boot text-terminal-muted"
                style={{ animationDelay: "1500ms" }}
              >
                {t.rich("hint", {
                  command: (chunks) => (
                    <span className="text-terminal-accent">{chunks}</span>
                  ),
                })}
              </p>

              <ol aria-label={t("historyLabel")} role="log" className="mt-5">
                {state.entries.map((entry) =>
                  entry.kind === "command" ? (
                    <li key={entry.id} className="flex items-start gap-x-2">
                      <PromptLabel />
                      <span className="min-w-0 whitespace-pre-wrap break-all">
                        {entry.input}
                      </span>
                    </li>
                  ) : (
                    <li key={entry.id}>
                      <TerminalOutput blocks={entry.blocks} />
                    </li>
                  ),
                )}
              </ol>

              <div className="terminal-boot" style={{ animationDelay: "1600ms" }}>
                <TerminalPrompt
                  value={state.input}
                  label={t("inputLabel")}
                  placeholder={t("placeholder")}
                  inputRef={inputRef}
                  onChange={(value) => dispatch({ type: "input", value })}
                  suggestion={suggestCompletion(state.input)}
                  onSubmit={handleSubmit}
                  onComplete={handleComplete}
                  onHistory={(direction) => dispatch({ type: "history", direction })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
