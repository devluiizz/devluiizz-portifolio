import { describe, expect, it } from "vitest";
import {
  completeInput,
  executeCommand,
  findCommand,
  formatDuration,
  suggestCompletion,
} from "./commands";
import { parseCommand } from "./parser";
import { resolveSection } from "./sections";
import type { CommandEnvironment, TerminalBlock } from "./types";

const env: CommandEnvironment = {
  theme: "light",
  now: Date.UTC(2026, 8, 23, 16, 32, 0),
  sessionStart: Date.UTC(2026, 8, 23, 16, 18, 18),
  timeZone: "America/Sao_Paulo",
};

function keys(blocks: TerminalBlock[]) {
  return blocks.map((block) => (block.type === "message" ? block.key : block.type));
}

describe("parseCommand", () => {
  it.each(["help", "  help", "help  ", "HELP", "Help"])("parses %j as help", (input) => {
    expect(parseCommand(input)?.name).toBe("help");
  });

  it("collapses repeated whitespace between arguments", () => {
    expect(parseCommand("theme     dark")).toEqual({
      name: "theme",
      raw: "theme",
      args: ["dark"],
    });
  });

  it("returns null for blank input", () => {
    expect(parseCommand("   ")).toBeNull();
  });
});

describe("executeCommand", () => {
  it("renders the help screen, also through the 'ajuda' alias", () => {
    expect(executeCommand("help", env).output).toEqual([{ type: "help" }]);
    expect(executeCommand("  AJUDA ", env).output).toEqual([{ type: "help" }]);
  });

  it("reports unknown commands with the name as typed and runs nothing", () => {
    const result = executeCommand("FooBar", env);
    expect(keys(result.output)).toEqual(["notFound", "notFoundHint"]);
    expect(result.output[0]).toMatchObject({ values: { command: "FooBar" } });
    expect(result.effect).toBeUndefined();
  });

  it.each([
    "<script>alert(1)</script>",
    "eval(alert(1))",
    "rm -rf /",
    "npm install",
    "powershell",
    "bash",
    "node -e process.exit()",
    "git status",
    "sudo su",
    "constructor",
    "__proto__",
    "toString",
  ])("treats %j as an unknown command", (input) => {
    const result = executeCommand(input, env);
    expect(keys(result.output)[0]).toBe("notFound");
    expect(result.effect).toBeUndefined();
  });

  it("does nothing for an empty line", () => {
    expect(executeCommand("   ", env)).toEqual({ output: [] });
  });

  describe("goto", () => {
    it("shows usage without an argument", () => {
      expect(keys(executeCommand("goto", env).output)).toEqual(["gotoUsage"]);
    });

    it("navigates to an existing section", () => {
      const result = executeCommand("goto projects", env);
      expect(result.effect).toEqual({ type: "navigate", section: "projects" });
      expect(keys(result.output)).toEqual(["navigating"]);
    });

    it.each([
      ["home", "home"],
      ["INÍCIO", "home"],
      ["projetos", "projects"],
      ["sobre", "about"],
      ["trajetória", "experience"],
      ["contato", "contact"],
      ["terminal", "terminal"],
    ])("resolves %j to %s", (alias, section) => {
      expect(executeCommand(`goto ${alias}`, env).effect).toEqual({
        type: "navigate",
        section,
      });
    });

    it("lists the available sections for an unknown one and does not navigate", () => {
      const result = executeCommand("goto banana", env);
      expect(keys(result.output)).toEqual(["sectionNotFound", "sections"]);
      expect(result.effect).toBeUndefined();
    });

    it("does not invent sections that the site does not have", () => {
      expect(resolveSection("skills")).toBeUndefined();
    });
  });

  it("clears through an effect without output", () => {
    expect(executeCommand("clear", env)).toEqual({
      output: [],
      effect: { type: "clear" },
    });
  });

  it("exits with a closing message", () => {
    const result = executeCommand("exit", env);
    expect(result.effect).toEqual({ type: "exit" });
    expect(keys(result.output)).toEqual(["exiting"]);
  });

  describe("theme", () => {
    it("shows the current theme and usage without an argument", () => {
      const result = executeCommand("theme", env);
      expect(keys(result.output)).toEqual(["themeCurrent", "themeUsage"]);
      expect(result.output[0]).toMatchObject({ values: { theme: "light" } });
    });

    it("switches theme, case-insensitively and with extra spaces", () => {
      expect(executeCommand("theme   DARK ", env).effect).toEqual({
        type: "theme",
        theme: "dark",
      });
      expect(executeCommand("theme escuro", env).effect).toEqual({
        type: "theme",
        theme: "dark",
      });
    });

    it("does not re-apply the current theme", () => {
      const result = executeCommand("theme light", env);
      expect(result.effect).toBeUndefined();
      expect(keys(result.output)).toEqual(["themeUnchanged"]);
    });

    it("rejects invalid themes without changing anything", () => {
      const result = executeCommand("theme blue", env);
      expect(result.effect).toBeUndefined();
      expect(keys(result.output)).toEqual(["themeInvalid", "themeUsage"]);
      expect(result.output[0]).toMatchObject({ values: { theme: "blue" } });
    });
  });

  it("returns the current time for date", () => {
    expect(executeCommand("date", env).output).toEqual([
      { type: "datetime", timestamp: env.now, timeZone: env.timeZone },
    ]);
  });

  it("computes uptime from the session start", () => {
    expect(executeCommand("uptime", env).output[0]).toMatchObject({
      key: "uptime",
      values: { duration: "00:13:42" },
    });
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "00:00:00"],
    [14_000, "00:00:14"],
    [(1 * 3600 + 23 * 60 + 47) * 1000, "01:23:47"],
    [((2 * 24 + 4) * 3600 + 12 * 60 + 33) * 1000, "2d 04:12:33"],
    [-5000, "00:00:00"],
  ])("formats %d ms as %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});

describe("completion", () => {
  it("completes a unique command, adding a space when it takes an argument", () => {
    expect(completeInput("th")).toBe("theme ");
    expect(completeInput("cl")).toBe("clear");
  });

  it("does nothing for ambiguous or unknown prefixes", () => {
    expect(completeInput("xyz")).toBeNull();
    expect(completeInput("")).toBeNull();
  });

  it("completes arguments from the command's own candidates", () => {
    expect(completeInput("goto pro")).toBe("goto projects");
    expect(completeInput("theme d")).toBe("theme dark");
    expect(completeInput("date x")).toBeNull();
  });

  it("suggests the rest of an unambiguous command name", () => {
    expect(suggestCompletion("g")).toBe("oto");
    expect(suggestCompletion("goto")).toBe("");
    expect(suggestCompletion("goto p")).toBe("");
  });

  it("only knows registered commands", () => {
    expect(findCommand("eval")).toBeUndefined();
    expect(findCommand("ajuda")?.name).toBe("help");
  });
});
