import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/lib/content/schema";
import { renderWithIntl } from "@/test/renderWithIntl";

const baseProject: Project = {
  title: "Projeto Teste",
  slug: "projeto-teste",
  summary: "Resumo do projeto.",
  problem: "Problema resolvido.",
  role: "Solo.",
  stack: ["TypeScript"],
  status: "live",
  featured: false,
  order: 0,
  highlights: [],
  learnings: [],
  media: [],
  content: "",
};

describe("ProjectCard", () => {
  it("does not render a media trigger when the project has no media", () => {
    renderWithIntl(<ProjectCard project={baseProject} featured={false} />);
    expect(screen.queryByRole("button", { name: /ver mídia/i })).not.toBeInTheDocument();
  });

  it("opens the lightbox with the first media item when the trigger is clicked", async () => {
    const project: Project = {
      ...baseProject,
      media: [
        { type: "image", src: "/shot-1.png", alt: "Tela inicial" },
        { type: "image", src: "/shot-2.png", alt: "Tela de projetos" },
      ],
    };
    renderWithIntl(<ProjectCard project={project} featured={false} />);

    await userEvent.click(screen.getByRole("button", { name: /ver mídia/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText("Tela inicial")).toBeInTheDocument();
  });

  it("returns focus to the trigger button after closing", async () => {
    const project: Project = {
      ...baseProject,
      media: [{ type: "image", src: "/shot-1.png", alt: "Tela inicial" }],
    };
    renderWithIntl(<ProjectCard project={project} featured={false} />);

    const trigger = screen.getByRole("button", { name: /ver mídia/i });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(trigger).toHaveFocus();
  });

  it("renders its interface copy in English", () => {
    const project: Project = {
      ...baseProject,
      status: "in-progress",
      media: [{ type: "image", src: "/shot-1.png", alt: "Home screen" }],
    };
    renderWithIntl(<ProjectCard project={project} featured={false} />, "en");

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View project media (1)" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Technologies used" })).toBeInTheDocument();
  });
});
