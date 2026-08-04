import { describe, expect, it } from "vitest";
import { experiences } from "./experiences";

describe("experiences", () => {
  it("has at least one real entry", () => {
    expect(experiences.length).toBeGreaterThan(0);
  });

  it("includes the current role at Atrio Imóveis", () => {
    const current = experiences.find((experience) => experience.endDate === null);
    expect(current?.company).toBe("Atrio Imóveis");
    expect(current?.role).toBe("Desenvolvedor de Sistemas de Tecnologia da Informação");
  });
});
