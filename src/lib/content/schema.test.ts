import { describe, expect, it } from "vitest";
import { experienceSchema, projectFrontmatterSchema } from "./schema";

const validFrontmatter = {
  title: "Example",
  slug: "example",
  summary: "A short summary.",
  problem: "A problem statement.",
  role: "Solo engineer.",
  stack: ["TypeScript"],
  status: "live",
};

describe("projectFrontmatterSchema", () => {
  it("accepts valid frontmatter and applies defaults", () => {
    const result = projectFrontmatterSchema.parse(validFrontmatter);
    expect(result.featured).toBe(false);
    expect(result.order).toBe(0);
    expect(result.highlights).toEqual([]);
  });

  it("rejects an invalid status", () => {
    expect(() =>
      projectFrontmatterSchema.parse({ ...validFrontmatter, status: "unknown" }),
    ).toThrow();
  });

  it("rejects an empty tech stack", () => {
    expect(() =>
      projectFrontmatterSchema.parse({ ...validFrontmatter, stack: [] }),
    ).toThrow();
  });

  it("rejects a malformed demo URL", () => {
    expect(() =>
      projectFrontmatterSchema.parse({ ...validFrontmatter, demoUrl: "not-a-url" }),
    ).toThrow();
  });
});

describe("experienceSchema", () => {
  const validExperience = {
    company: "Acme",
    role: { "pt-BR": "Engenheiro", en: "Engineer" },
    startDate: "2026-01",
    endDate: null,
    description: { "pt-BR": "Fez a coisa.", en: "Did the thing." },
    stack: ["TypeScript"],
  };

  it("accepts a valid experience and defaults highlights to empty per locale", () => {
    const result = experienceSchema.parse(validExperience);
    expect(result.highlights).toEqual({ "pt-BR": [], en: [] });
  });

  it("accepts a null endDate for an ongoing role", () => {
    expect(() => experienceSchema.parse(validExperience)).not.toThrow();
  });

  it("rejects an empty tech stack", () => {
    expect(() => experienceSchema.parse({ ...validExperience, stack: [] })).toThrow();
  });

  it("rejects a missing company", () => {
    expect(() => experienceSchema.parse({ ...validExperience, company: "" })).toThrow();
  });

  it("rejects a role without an English translation", () => {
    expect(() =>
      experienceSchema.parse({ ...validExperience, role: { "pt-BR": "Engenheiro" } }),
    ).toThrow();
  });
});

describe("projectFrontmatterSchema media field", () => {
  it("defaults media to an empty array", () => {
    const result = projectFrontmatterSchema.parse(validFrontmatter);
    expect(result.media).toEqual([]);
  });

  it("accepts a valid media item", () => {
    const result = projectFrontmatterSchema.parse({
      ...validFrontmatter,
      media: [{ type: "image", src: "/shot.png", alt: "Tela do app" }],
    });
    expect(result.media).toHaveLength(1);
  });

  it("rejects an invalid media type", () => {
    expect(() =>
      projectFrontmatterSchema.parse({
        ...validFrontmatter,
        media: [{ type: "audio", src: "/shot.mp3", alt: "Som" }],
      }),
    ).toThrow();
  });
});
