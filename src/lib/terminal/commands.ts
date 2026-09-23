import type { Theme } from "@/lib/theme";
import { normalizeToken, parseCommand } from "./parser";
import { SECTIONS, resolveSection } from "./sections";
import type {
  CommandContext,
  CommandEnvironment,
  CommandResult,
  TerminalBlock,
} from "./types";

export type CommandCategory = "navigation" | "system";
export type CommandName =
  "help" | "goto" | "clear" | "exit" | "theme" | "date" | "uptime";

export interface CommandDefinition {
  name: CommandName;
  category: CommandCategory;
  /** Syntax shown in help; command names and arguments stay in English. */
  usage: string;
  /** Listed in the help screen. `help` itself is the entry point, so it is not. */
  listed: boolean;
  /** Candidates offered by TAB completion for the first argument. */
  argumentCompletions?: readonly string[];
  run: (context: CommandContext) => CommandResult;
}

export const COMMAND_CATEGORIES: readonly CommandCategory[] = ["navigation", "system"];

const THEME_ALIASES: Record<string, Theme> = {
  light: "light",
  claro: "light",
  dark: "dark",
  escuro: "dark",
};

function message(
  key: Extract<TerminalBlock, { type: "message" }>["key"],
  tone: Extract<TerminalBlock, { type: "message" }>["tone"] = "default",
  values?: Record<string, string>,
): TerminalBlock {
  return { type: "message", key, tone, values };
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const clock = [
    Math.floor((totalSeconds % 86_400) / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
  return days > 0 ? `${days}d ${clock}` : clock;
}

export const COMMANDS: readonly CommandDefinition[] = [
  {
    name: "help",
    category: "system",
    usage: "help",
    listed: false,
    run: () => ({ output: [{ type: "help" }] }),
  },
  {
    name: "goto",
    category: "navigation",
    usage: "goto [section]",
    listed: true,
    argumentCompletions: SECTIONS,
    run: ({ args }) => {
      if (args.length !== 1) return { output: [message("gotoUsage", "muted")] };
      const section = resolveSection(args[0]);
      if (!section) {
        return {
          output: [
            message("sectionNotFound", "error", { section: args[0] }),
            { type: "sections" },
          ],
        };
      }
      return {
        output: [message("navigating", "info", { section })],
        effect: { type: "navigate", section },
      };
    },
  },
  {
    name: "clear",
    category: "navigation",
    usage: "clear",
    listed: true,
    run: () => ({ output: [], effect: { type: "clear" } }),
  },
  {
    name: "exit",
    category: "navigation",
    usage: "exit",
    listed: true,
    run: () => ({ output: [message("exiting", "muted")], effect: { type: "exit" } }),
  },
  {
    name: "theme",
    category: "system",
    usage: "theme [light/dark]",
    listed: true,
    argumentCompletions: ["light", "dark"],
    run: ({ args, theme }) => {
      if (args.length === 0) {
        return {
          output: [
            message("themeCurrent", "default", { theme }),
            message("themeUsage", "muted"),
          ],
        };
      }
      const requested = args.join(" ");
      const next =
        args.length === 1 ? THEME_ALIASES[normalizeToken(requested)] : undefined;
      if (!next) {
        return {
          output: [
            message("themeInvalid", "error", { theme: requested }),
            message("themeUsage", "muted"),
          ],
        };
      }
      if (next === theme) {
        return { output: [message("themeUnchanged", "muted", { theme: next })] };
      }
      return {
        output: [message("themeChanged", "success", { theme: next })],
        effect: { type: "theme", theme: next },
      };
    },
  },
  {
    name: "date",
    category: "system",
    usage: "date",
    listed: true,
    run: ({ now, timeZone }) => ({
      output: [{ type: "datetime", timestamp: now, timeZone }],
    }),
  },
  {
    name: "uptime",
    category: "system",
    usage: "uptime",
    listed: true,
    run: ({ now, sessionStart }) => ({
      output: [
        message("uptime", "default", { duration: formatDuration(now - sessionStart) }),
      ],
    }),
  },
];

// A Map (not a plain object) so inputs like "constructor" or "__proto__" can
// never resolve to anything but "not found".
const REGISTRY = new Map<string, CommandDefinition>(
  COMMANDS.map((command) => [command.name, command]),
);
const ALIASES = new Map<string, CommandName>([["ajuda", "help"]]);

export function findCommand(name: string): CommandDefinition | undefined {
  return REGISTRY.get(ALIASES.get(name) ?? name);
}

export function executeCommand(
  input: string,
  environment: CommandEnvironment,
): CommandResult {
  const parsed = parseCommand(input);
  if (!parsed) return { output: [] };

  const command = findCommand(parsed.name);
  if (!command) {
    return {
      output: [
        message("notFound", "error", { command: parsed.raw }),
        message("notFoundHint", "muted"),
      ],
    };
  }
  return command.run({ ...environment, args: parsed.args });
}

function matches(partial: string, candidates: readonly string[]): string[] {
  const token = normalizeToken(partial);
  return candidates.filter((candidate) => candidate.startsWith(token));
}

function commonPrefix(values: string[]): string {
  return values.reduce((prefix, value) => {
    let length = 0;
    while (length < prefix.length && prefix[length] === value[length]) length += 1;
    return prefix.slice(0, length);
  });
}

// TAB completion: finishes a unique match, or extends to the longest shared prefix.
export function completeInput(input: string): string | null {
  const leading = input.match(/^\s*/)?.[0] ?? "";
  const body = input.slice(leading.length);
  const commandMatch = body.match(/^(\S*)$/);

  if (commandMatch) {
    const found = matches(
      commandMatch[1],
      COMMANDS.map((command) => command.name),
    );
    if (found.length === 0) return null;
    if (found.length === 1) {
      const command = findCommand(found[0]);
      return `${leading}${found[0]}${command?.argumentCompletions ? " " : ""}`;
    }
    const prefix = commonPrefix(found);
    return prefix.length > commandMatch[1].length ? `${leading}${prefix}` : null;
  }

  const argumentMatch = body.match(/^(\S+)(\s+)(\S*)$/);
  if (!argumentMatch) return null;
  const [, name, gap, partial] = argumentMatch;
  const candidates = findCommand(normalizeToken(name))?.argumentCompletions;
  if (!candidates) return null;

  const found = matches(partial, candidates);
  if (found.length === 0) return null;
  const completed = found.length === 1 ? found[0] : commonPrefix(found);
  return completed.length > partial.length ? `${leading}${name}${gap}${completed}` : null;
}

// Inline ghost suggestion: only for an unambiguous command name being typed.
export function suggestCompletion(input: string): string {
  if (!/^\S+$/.test(input)) return "";
  const found = matches(
    input,
    COMMANDS.map((command) => command.name),
  );
  return found.length === 1 && found[0] !== normalizeToken(input)
    ? found[0].slice(input.length)
    : "";
}
