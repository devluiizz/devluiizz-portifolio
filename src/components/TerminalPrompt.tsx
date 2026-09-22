"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type RefObject } from "react";

export function PromptLabel() {
  return (
    <span aria-hidden="true" className="shrink-0 select-none">
      <span className="text-terminal-accent">user@devluiizz</span>
      <span className="text-terminal-muted">:-$</span>
    </span>
  );
}

interface TerminalPromptProps {
  value: string;
  label: string;
  placeholder: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistory: (direction: "previous" | "next") => void;
}

export function TerminalPrompt({
  value,
  label,
  placeholder,
  inputRef,
  onChange,
  onSubmit,
  onHistory,
}: TerminalPromptProps) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const [focused, setFocused] = useState(false);

  // The visible text and block cursor are drawn by the mirror layer; the real
  // input stays on top (transparent) so typing, selection and IME keep working.
  const syncCaret = useCallback(() => {
    const field = inputRef.current;
    if (!field) return;
    const start = field.selectionStart ?? field.value.length;
    setCaret(start);
    setHasSelection(start !== (field.selectionEnd ?? start));
    if (mirrorRef.current) mirrorRef.current.scrollLeft = field.scrollLeft;
  }, [inputRef]);

  function moveCaretToEnd() {
    requestAnimationFrame(() => {
      const field = inputRef.current;
      if (!field) return;
      field.setSelectionRange(field.value.length, field.value.length);
      syncCaret();
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      onHistory(event.key === "ArrowUp" ? "previous" : "next");
      moveCaretToEnd();
      return;
    }
    requestAnimationFrame(syncCaret);
  }

  const before = value.slice(0, caret);
  const under = value[caret] ?? " ";
  const after = value.slice(caret + 1);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
        setCaret(0);
      }}
      className="group/prompt -mx-2 flex items-start gap-x-2 rounded-md px-2 transition-colors focus-within:bg-terminal-accent/[0.06]"
    >
      <PromptLabel />
      <div className="relative min-w-0 flex-1">
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre"
        >
          {before}
          {!hasSelection && (
            <span
              key={`${value}-${caret}`}
              className={`inline-block w-[1ch] rounded-[2px] ${
                focused
                  ? "terminal-cursor-blink bg-terminal-accent text-terminal-bg"
                  : "outline outline-1 -outline-offset-1 outline-terminal-accent/70"
              }`}
            >
              {under}
            </span>
          )}
          {hasSelection && value[caret]}
          {after}
          {value === "" && <span className="text-terminal-muted">{placeholder}</span>}
        </div>
        <label htmlFor="terminal-input" className="sr-only">
          {label}
        </label>
        <input
          ref={inputRef}
          id="terminal-input"
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          onChange={(event) => {
            onChange(event.target.value);
            requestAnimationFrame(syncCaret);
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={syncCaret}
          onSelect={syncCaret}
          onClick={syncCaret}
          onFocus={() => {
            setFocused(true);
            requestAnimationFrame(syncCaret);
          }}
          onBlur={() => setFocused(false)}
          className="terminal-input relative block w-full bg-transparent text-transparent caret-transparent outline-none placeholder:text-transparent selection:bg-terminal-accent/35"
        />
      </div>
    </form>
  );
}
