import { describe, expect, it } from "vitest";
import { submitContact } from "./actions";
import { CONTACT_LIMITS, validateContact } from "./schema";

const valid = {
  name: "Maria Souza",
  email: "maria@exemplo.com",
  message: "Quero conversar sobre um sistema de agendamento.",
};

describe("validateContact", () => {
  it("accepts a valid message and trims whitespace", () => {
    const result = validateContact({ ...valid, name: "  Maria Souza  " });
    expect(result).toEqual({ success: true, data: valid });
  });

  it.each([
    [{ name: "" }, { name: "nameRequired" }],
    [{ name: "L" }, { name: "nameTooShort" }],
    [{ name: "x".repeat(CONTACT_LIMITS.nameMax + 1) }, { name: "nameTooLong" }],
    [{ email: "" }, { email: "emailRequired" }],
    [{ email: "maria@" }, { email: "emailInvalid" }],
    [{ email: "maria exemplo.com" }, { email: "emailInvalid" }],
    [{ message: "   " }, { message: "messageRequired" }],
    [{ message: "curta" }, { message: "messageTooShort" }],
    [
      { message: "x".repeat(CONTACT_LIMITS.messageMax + 1) },
      { message: "messageTooLong" },
    ],
  ])("reports %j as %j", (override, errors) => {
    expect(validateContact({ ...valid, ...override })).toEqual({
      success: false,
      errors,
    });
  });
});

describe("submitContact (server action)", () => {
  it("re-validates on the server", async () => {
    expect(await submitContact({ ...valid, email: "nope", website: "" })).toEqual({
      status: "invalid",
      errors: { email: "emailInvalid" },
    });
  });

  it("reports delivery as unavailable while no provider is configured", async () => {
    expect(await submitContact({ ...valid, website: "" })).toEqual({
      status: "unavailable",
    });
  });

  it("silently drops submissions that fill the honeypot", async () => {
    expect(await submitContact({ ...valid, website: "https://spam.example" })).toEqual({
      status: "sent",
    });
  });

  it("treats malformed payloads as invalid instead of throwing", async () => {
    const result = await submitContact({ name: 42, email: null } as never);
    expect(result.status).toBe("invalid");
  });
});
