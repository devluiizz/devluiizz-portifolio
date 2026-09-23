import type messages from "../../../messages/pt-BR.json";
import type { Theme } from "@/lib/theme";
import type { SectionId } from "./sections";

export type OutputMessageKey = keyof (typeof messages)["terminal"]["output"];

export type OutputTone = "default" | "muted" | "info" | "success" | "error";

// Output is structured data rendered by the UI (and translated there), never raw
// markup, so user input can only ever be displayed as text.
export type TerminalBlock =
  | {
      type: "message";
      key: OutputMessageKey;
      tone?: OutputTone;
      values?: Record<string, string>;
    }
  | { type: "help" }
  | { type: "sections" }
  | { type: "datetime"; timestamp: number; timeZone: string };

export type TerminalEffect =
  | { type: "clear" }
  | { type: "navigate"; section: SectionId }
  | { type: "theme"; theme: Theme }
  | { type: "exit" };

export interface CommandEnvironment {
  theme: Theme;
  now: number;
  sessionStart: number;
  timeZone: string;
}

export interface CommandContext extends CommandEnvironment {
  args: string[];
}

export interface CommandResult {
  output: TerminalBlock[];
  effect?: TerminalEffect;
}
