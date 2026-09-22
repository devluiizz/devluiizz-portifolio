import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import ptBR from "../../messages/pt-BR.json";
import en from "../../messages/en.json";
import { loadMessages } from "./messages";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? { ...acc, [path]: value }
      : { ...acc, ...flatten(value, path) };
  }, {});
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();
}

const flatPtBR = flatten(ptBR);
const flatEn = flatten(en);

describe("translation messages", () => {
  it("has exactly the same keys in every locale", () => {
    expect(Object.keys(flatEn).sort()).toEqual(Object.keys(flatPtBR).sort());
  });

  it("has no empty messages", () => {
    for (const [key, value] of Object.entries({ ...flatPtBR, ...flatEn })) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("uses the same interpolation arguments in every locale", () => {
    for (const [key, value] of Object.entries(flatPtBR)) {
      expect(placeholders(flatEn[key] ?? ""), key).toEqual(placeholders(value));
    }
  });
});

function tags(message: string): string[] {
  return [...message.matchAll(/<(\w+)>/g)].map((match) => match[1]).sort();
}

describe.each([
  ["pt-BR", ptBR, flatPtBR],
  ["en", en, flatEn],
] as const)("%s messages", (locale, messages, flat) => {
  it("all parse and format without errors", () => {
    const errors: string[] = [];
    const t = createTranslator({
      locale,
      messages,
      timeZone: "UTC",
      onError: (error) => errors.push(error.message),
    });

    for (const [key, message] of Object.entries(flat)) {
      const values: Record<string, string | ((chunks: string) => string)> = {};
      for (const name of placeholders(message)) values[name] = "x";
      for (const name of tags(message)) values[name] = (chunks) => chunks;
      const output = t.markup(key as never, values as never);
      expect(output, key).not.toContain("<");
    }
    expect(errors).toEqual([]);
  });

  it("keeps rich-text tags identical to pt-BR", () => {
    for (const [key, message] of Object.entries(flatPtBR)) {
      expect(tags(flat[key] ?? ""), key).toEqual(tags(message));
    }
  });
});

describe("loadMessages", () => {
  it("returns the default locale messages as-is", async () => {
    expect(await loadMessages("pt-BR")).toEqual(ptBR);
  });

  it("returns the English messages for en", async () => {
    const messages = await loadMessages("en");
    expect(messages.navigation.home).toBe("Home");
    expect(flatten(messages as unknown as Tree)).toEqual(flatEn);
  });
});
