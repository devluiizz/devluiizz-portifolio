import type { TerminalBlock } from "./types";

// Terminal session state. Commands are executed outside the reducer (see
// commands.ts); the reducer only records the submitted line and its output.

export interface TerminalCommandEntry {
  id: number;
  kind: "command";
  input: string;
}

export interface TerminalOutputEntry {
  id: number;
  kind: "output";
  blocks: TerminalBlock[];
}

export type TerminalEntry = TerminalCommandEntry | TerminalOutputEntry;

export interface TerminalState {
  entries: TerminalEntry[];
  input: string;
  history: string[];
  historyIndex: number | null;
  draft: string;
  nextId: number;
}

export type TerminalAction =
  | { type: "input"; value: string }
  | { type: "submit"; output?: TerminalBlock[]; clear?: boolean }
  | { type: "history"; direction: "previous" | "next" };

export const MAX_TERMINAL_ENTRIES = 200;

export const initialTerminalState: TerminalState = {
  entries: [],
  input: "",
  history: [],
  historyIndex: null,
  draft: "",
  nextId: 0,
};

export function terminalReducer(
  state: TerminalState,
  action: TerminalAction,
): TerminalState {
  switch (action.type) {
    case "input":
      return { ...state, input: action.value, historyIndex: null };

    case "submit": {
      const input = state.input.trimEnd();
      const history =
        input.trim() !== "" && state.history.at(-1) !== input
          ? [...state.history, input]
          : state.history;

      const added: TerminalEntry[] = [{ id: state.nextId, kind: "command", input }];
      if (action.output && action.output.length > 0) {
        added.push({ id: state.nextId + 1, kind: "output", blocks: action.output });
      }

      return {
        ...state,
        entries: action.clear
          ? []
          : [...state.entries, ...added].slice(-MAX_TERMINAL_ENTRIES),
        input: "",
        history,
        historyIndex: null,
        draft: "",
        nextId: state.nextId + added.length,
      };
    }

    case "history": {
      if (state.history.length === 0) return state;
      const last = state.history.length - 1;

      if (action.direction === "previous") {
        const index =
          state.historyIndex === null ? last : Math.max(0, state.historyIndex - 1);
        return {
          ...state,
          historyIndex: index,
          draft: state.historyIndex === null ? state.input : state.draft,
          input: state.history[index],
        };
      }

      if (state.historyIndex === null) return state;
      if (state.historyIndex >= last) {
        return { ...state, historyIndex: null, input: state.draft };
      }
      const index = state.historyIndex + 1;
      return { ...state, historyIndex: index, input: state.history[index] };
    }
  }
}
