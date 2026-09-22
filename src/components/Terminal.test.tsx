import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/test/renderWithIntl";
import { Terminal } from "./Terminal";

describe("Terminal", () => {
  it("renders the window title, identity and hint", () => {
    renderWithIntl(<Terminal year={2026} />);
    expect(screen.getByText(/DEVLUIIZZ\.EXE/)).toBeInTheDocument();
    expect(screen.getByText("DEVLUIIZZ")).toBeInTheDocument();
    expect(screen.getByText("DEVLUIIZZ OS v2.0")).toBeInTheDocument();
    expect(
      screen.getByText("(c) 2026 Luiz Felipe. Todos os direitos reservados."),
    ).toBeInTheDocument();
    expect(screen.getByText("'ajuda'")).toBeInTheDocument();
  });

  it("echoes submitted commands without producing any output", async () => {
    renderWithIntl(<Terminal year={2026} />);
    const input = screen.getByRole("textbox", { name: "Comando do terminal" });

    await userEvent.type(input, "ajuda{Enter}projetos{Enter}");

    const log = screen.getByRole("log", { name: "Comandos digitados" });
    const lines = within(log).getAllByRole("listitem");
    expect(lines.map((line) => line.textContent)).toEqual([
      "user@devluiizz:-$ajuda",
      "user@devluiizz:-$projetos",
    ]);
    expect(input).toHaveValue("");
  });

  it("recalls previous commands with the arrow keys", async () => {
    renderWithIntl(<Terminal year={2026} />);
    const input = screen.getByRole("textbox", { name: "Comando do terminal" });

    await userEvent.type(input, "quem-sou{Enter}{ArrowUp}");
    expect(input).toHaveValue("quem-sou");
  });

  it("renders in English", () => {
    renderWithIntl(<Terminal year={2026} />, "en");
    expect(screen.getByRole("textbox", { name: "Terminal command" })).toHaveAttribute(
      "placeholder",
      "Type a command",
    );
    expect(
      screen.getByText("(c) 2026 Luiz Felipe. All rights reserved."),
    ).toBeInTheDocument();
  });
});
