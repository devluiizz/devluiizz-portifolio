import { describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectMediaLightbox } from "./ProjectMediaLightbox";
import type { ProjectMedia } from "@/lib/content/schema";
import { renderWithIntl } from "@/test/renderWithIntl";

const media: ProjectMedia[] = [
  { type: "image", src: "/one.png", alt: "Tela um" },
  { type: "image", src: "/two.png", alt: "Tela dois" },
];

function renderLightbox(index = 0) {
  const onIndexChange = vi.fn();
  const onClose = vi.fn();
  renderWithIntl(
    <ProjectMediaLightbox
      media={media}
      index={index}
      onIndexChange={onIndexChange}
      onClose={onClose}
      projectTitle="Projeto Teste"
    />,
  );
  return { onIndexChange, onClose };
}

describe("ProjectMediaLightbox", () => {
  it("shows the current media and position counter", () => {
    renderLightbox(0);
    expect(screen.getByAltText("Tela um")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const { onClose } = renderLightbox(0);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("advances to the next item on ArrowRight and on the 'Próxima mídia' button", async () => {
    const { onIndexChange } = renderLightbox(0);
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(onIndexChange).toHaveBeenCalledWith(1);

    await userEvent.click(screen.getByRole("button", { name: "Próxima mídia" }));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it("wraps to the last item on ArrowLeft from the first item", () => {
    const { onIndexChange } = renderLightbox(0);
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("closes when clicking the backdrop but not the dialog content", async () => {
    const { onClose } = renderLightbox(0);
    await userEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByTestId("lightbox-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the close button on mount", () => {
    renderLightbox(0);
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
  });

  it("renders via a portal directly into document.body", () => {
    renderLightbox(0);
    const backdrop = screen.getByTestId("lightbox-backdrop");
    expect(backdrop.parentElement).toBe(document.body);
  });
});
