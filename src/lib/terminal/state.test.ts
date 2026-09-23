import { describe, expect, it } from "vitest";
import {
  MAX_TERMINAL_ENTRIES,
  initialTerminalState,
  terminalReducer,
  type TerminalAction,
  type TerminalState,
} from "./state";

function run(actions: TerminalAction[], state: TerminalState = initialTerminalState) {
  return actions.reduce(terminalReducer, state);
}

function type(value: string): TerminalAction[] {
  return [{ type: "input", value }, { type: "submit" }];
}

describe("terminalReducer", () => {
  it("records a submitted line as a command entry and clears the input", () => {
    const state = run(type("ajuda"));
    expect(state.entries).toEqual([{ id: 0, kind: "command", input: "ajuda" }]);
    expect(state.input).toBe("");
  });

  it("records empty submissions as blank prompt lines without adding them to history", () => {
    const state = run([{ type: "submit" }]);
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]).toMatchObject({ kind: "command", input: "" });
    expect(state.history).toEqual([]);
  });

  it("appends the output produced for a submitted command", () => {
    const state = run([
      { type: "input", value: "help" },
      { type: "submit", output: [{ type: "help" }] },
    ]);
    expect(state.entries).toEqual([
      { id: 0, kind: "command", input: "help" },
      { id: 1, kind: "output", blocks: [{ type: "help" }] },
    ]);
    expect(state.nextId).toBe(2);
  });

  it("clears the screen but keeps command history", () => {
    const state = run([
      ...type("date"),
      { type: "input", value: "clear" },
      { type: "submit", clear: true },
    ]);
    expect(state.entries).toEqual([]);
    expect(state.history).toEqual(["date", "clear"]);
  });

  it("walks back and forth through history, restoring the draft at the end", () => {
    let state = run([...type("one"), ...type("two"), { type: "input", value: "draft" }]);
    state = run([{ type: "history", direction: "previous" }], state);
    expect(state.input).toBe("two");
    state = run([{ type: "history", direction: "previous" }], state);
    expect(state.input).toBe("one");
    state = run([{ type: "history", direction: "previous" }], state);
    expect(state.input).toBe("one");
    state = run(
      [
        { type: "history", direction: "next" },
        { type: "history", direction: "next" },
      ],
      state,
    );
    expect(state.input).toBe("draft");
  });

  it("does not store consecutive duplicate commands in history", () => {
    const state = run([...type("ls"), ...type("ls")]);
    expect(state.history).toEqual(["ls"]);
    expect(state.entries).toHaveLength(2);
  });

  it("caps the number of rendered entries", () => {
    const actions = Array.from({ length: MAX_TERMINAL_ENTRIES + 5 }, (_, i) =>
      type(`c${i}`),
    ).flat();
    const state = run(actions);
    expect(state.entries).toHaveLength(MAX_TERMINAL_ENTRIES);
    expect(state.entries.at(-1)).toMatchObject({ input: `c${MAX_TERMINAL_ENTRIES + 4}` });
  });
});
