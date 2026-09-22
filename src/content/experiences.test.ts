import { describe, expect, it } from "vitest";
import { getExperiences } from "./experiences";

describe("experiences", () => {
  it("has at least one real entry", () => {
    expect(getExperiences("pt-BR").length).toBeGreaterThan(0);
  });

  it("includes the current role at Atrio Imóveis", () => {
    const current = getExperiences("pt-BR").find(
      (experience) => experience.endDate === null,
    );
    expect(current?.company).toBe("Atrio Imóveis");
    expect(current?.role).toBe("Desenvolvedor de Sistemas de Tecnologia da Informação");
  });

  it("resolves translated fields for English while keeping shared data", () => {
    const [ptBR] = getExperiences("pt-BR");
    const [en] = getExperiences("en");
    expect(en.role).toBe("IT Systems Developer");
    expect(en.description).not.toBe(ptBR.description);
    expect(en.highlights).toHaveLength(ptBR.highlights.length);
    expect(en.stack).toEqual(ptBR.stack);
    expect(en.startDate).toBe(ptBR.startDate);
  });
});
