"use client";

import { Fragment } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { COMMAND_CATEGORIES, COMMANDS } from "@/lib/terminal/commands";
import { SECTIONS } from "@/lib/terminal/sections";
import type { OutputTone, TerminalBlock } from "@/lib/terminal/types";

const TONE_CLASS: Record<OutputTone, string> = {
  default: "text-terminal-text",
  muted: "text-terminal-muted",
  info: "text-terminal-accent",
  success: "text-success",
  error: "text-error",
};

const TONE_MARK: Partial<Record<OutputTone, string>> = {
  info: "→",
  success: "✓",
  error: "✗",
};

function MessageBlock({ block }: { block: Extract<TerminalBlock, { type: "message" }> }) {
  const t = useTranslations("terminal.output");
  const tone = block.tone ?? "default";
  const mark = TONE_MARK[tone];

  return (
    <p className={`flex gap-2 ${TONE_CLASS[tone]}`}>
      {mark && (
        <span aria-hidden="true" className="shrink-0">
          {mark}
        </span>
      )}
      <span className="min-w-0 whitespace-pre-wrap break-all">
        {/* Tag names share the values object with placeholders, so they must differ. */}
        {t.rich(block.key, {
          ...block.values,
          code: (chunks) => <span className="text-terminal-accent">{chunks}</span>,
        })}
      </span>
    </p>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-4 bg-terminal-accent/60" aria-hidden="true" />
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-terminal-accent [text-shadow:0_0_12px_var(--terminal-glow)]">
        {label}
      </span>
      <span
        className="h-px flex-1 bg-gradient-to-r from-terminal-line to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

function HelpBlock() {
  const t = useTranslations("terminal.help");

  return (
    <div className="my-2 max-w-3xl rounded-lg border border-terminal-line/80 bg-terminal-bar/60 px-4 py-4 sm:px-5">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-terminal-muted">
        DEVLUIIZZ OS v2.0 · {t("title")}
      </p>
      <div className="space-y-4">
        {COMMAND_CATEGORIES.map((category) => (
          <div key={category}>
            <SectionHeading label={t(`categories.${category}`)} />
            <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(11rem,auto)_1fr] sm:gap-y-1">
              {COMMANDS.filter(
                (command) => command.listed && command.category === category,
              ).map((command) => {
                const [name, ...args] = command.usage.split(" ");
                return (
                  <Fragment key={command.name}>
                    <dt className="whitespace-nowrap">
                      <span className="font-medium text-terminal-accent">{name}</span>
                      {args.length > 0 && (
                        <span className="text-terminal-muted"> {args.join(" ")}</span>
                      )}
                    </dt>
                    <dd className="pl-4 text-terminal-text/80 sm:pl-0">
                      {t(
                        `commands.${command.name as Exclude<typeof command.name, "help">}`,
                      )}
                    </dd>
                  </Fragment>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-terminal-muted">
        {t.rich("tip", {
          key: (chunks) => (
            <kbd className="rounded border border-terminal-line px-1.5 font-mono text-[11px] text-terminal-text">
              {chunks}
            </kbd>
          ),
        })}
      </p>
    </div>
  );
}

function SectionsBlock() {
  const t = useTranslations("terminal.output");
  const tNav = useTranslations("navigation");

  return (
    <div className="text-terminal-muted">
      <p>{t("availableSections")}</p>
      <ul className="mt-1 grid gap-x-6 pl-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <li key={section} className="flex gap-2">
            <span className="text-terminal-accent">{section}</span>
            <span className="truncate">· {tNav(section)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DateTimeBlock({
  block,
}: {
  block: Extract<TerminalBlock, { type: "datetime" }>;
}) {
  const format = useFormatter();
  const formatted = format.dateTime(new Date(block.timestamp), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: block.timeZone,
  });

  return (
    <p className="flex flex-wrap gap-x-3">
      <time dateTime={new Date(block.timestamp).toISOString()}>{formatted}</time>
      <span className="text-terminal-muted">{block.timeZone}</span>
    </p>
  );
}

export function TerminalOutput({ blocks }: { blocks: TerminalBlock[] }) {
  return (
    <div className="terminal-output mb-2 space-y-0.5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "message":
            return <MessageBlock key={index} block={block} />;
          case "help":
            return <HelpBlock key={index} />;
          case "sections":
            return <SectionsBlock key={index} />;
          case "datetime":
            return <DateTimeBlock key={index} block={block} />;
        }
      })}
    </div>
  );
}
