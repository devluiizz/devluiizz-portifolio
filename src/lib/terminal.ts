// Terminal session state. Submitted lines are recorded but never interpreted:
// a command dispatcher (parser → registry → handler) can later hook into the
// "submit" transition and append output entries to the same log.

export interface TerminalCommandEntry {
  id: number;
  kind: "command";
  input: string;
}

export type TerminalEntry = TerminalCommandEntry;

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
  | { type: "submit" }
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
      const entry: TerminalCommandEntry = { id: state.nextId, kind: "command", input };
      const history =
        input.trim() !== "" && state.history.at(-1) !== input
          ? [...state.history, input]
          : state.history;
      return {
        ...state,
        entries: [...state.entries, entry].slice(-MAX_TERMINAL_ENTRIES),
        input: "",
        history,
        historyIndex: null,
        draft: "",
        nextId: state.nextId + 1,
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
