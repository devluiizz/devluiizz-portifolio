export interface ParsedCommand {
  /** Normalized command name used for lookup. */
  name: string;
  /** The command token exactly as typed, for echoing back in messages. */
  raw: string;
  args: string[];
}

// Lowercase and accent-insensitive, so "Início" and "inicio" match the same alias.
export function normalizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function parseCommand(input: string): ParsedCommand | null {
  const [raw, ...args] = input.trim().split(/\s+/).filter(Boolean);
  if (!raw) return null;
  return { name: normalizeToken(raw), raw, args };
}
