import { describe, expect, it } from "vitest";
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
