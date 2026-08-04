import { describe, expect, it } from "vitest";
import { projectFrontmatterSchema } from "./schema";

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
