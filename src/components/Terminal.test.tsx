import { beforeEach, describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/lib/theme";
import { renderWithIntl } from "@/test/renderWithIntl";
import { Terminal } from "./Terminal";

function renderTerminal(locale: Locale = "pt-BR") {
  return renderWithIntl(
    <ThemeProvider>
      <Terminal year={2026} />
    </ThemeProvider>,
    locale,
  );
}

function getInput(name = "Comando do terminal") {
  return screen.getByRole("textbox", { name });
}

describe("Terminal", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  it("renders the window title, identity and hint", () => {
    renderTerminal();
    expect(screen.getByText(/DEVLUIIZZ\.EXE/)).toBeInTheDocument();
    expect(screen.getByText("DEVLUIIZZ")).toBeInTheDocument();
    expect(screen.getByText("DEVLUIIZZ OS v2.0")).toBeInTheDocument();
    expect(
      screen.getByText("(c) 2026 Luiz Felipe. Todos os direitos reservados."),
    ).toBeInTheDocument();
    expect(screen.getByText("'ajuda'")).toBeInTheDocument();
  });

  it("shows the command reference for help and keeps the input focused", async () => {
    renderTerminal();
    const input = getInput();

    await userEvent.type(input, "help{Enter}");

    const log = screen.getByRole("log", { name: "Comandos digitados" });
    expect(within(log).getByText("Navegação")).toBeInTheDocument();
    expect(within(log).getByText("Sistema")).toBeInTheDocument();
    expect(within(log).getByText("[section]")).toBeInTheDocument();
    expect(within(log).getByText("Exibe a data e hora atuais.")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });

  it("reports unknown commands in the current language", async () => {
    renderTerminal();
    await userEvent.type(getInput(), "foobar{Enter}");
    expect(screen.getByText("Comando não encontrado: foobar")).toBeInTheDocument();
  });

  it("renders typed markup as plain text", async () => {
    renderTerminal();
    await userEvent.type(getInput(), "<img src=x onerror=alert(1)>{Enter}");
    expect(document.querySelector(".terminal-screen img")).toBeNull();
    expect(screen.getByText("Comando não encontrado: <img")).toBeInTheDocument();
  });

  it("switches the site theme through the shared theme provider", async () => {
    renderTerminal();
    await userEvent.type(getInput(), "theme dark{Enter}");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(screen.getByText("Tema alterado para dark.")).toBeInTheDocument();

    await userEvent.type(getInput(), "theme{Enter}");
    expect(screen.getByText("Tema atual: dark")).toBeInTheDocument();
  });

  it("clears the screen immediately", async () => {
    renderTerminal();
    await userEvent.type(getInput(), "help{Enter}date{Enter}clear{Enter}");
    const log = screen.getByRole("log", { name: "Comandos digitados" });
    expect(within(log).queryAllByRole("listitem")).toHaveLength(0);
  });

  it("completes commands with TAB", async () => {
    renderTerminal();
    const input = getInput();
    await userEvent.type(input, "th");
    await userEvent.keyboard("{Tab}");
    expect(input).toHaveValue("theme ");
    expect(input).toHaveFocus();
  });

  it("recalls previous commands with the arrow keys", async () => {
    renderTerminal();
    const input = getInput();
    await userEvent.type(input, "uptime{Enter}{ArrowUp}");
    expect(input).toHaveValue("uptime");
  });

  it("renders in English", async () => {
    renderTerminal("en");
    const input = getInput("Terminal command");
    expect(input).toHaveAttribute("placeholder", "Type a command");
    await userEvent.type(input, "goto banana{Enter}");
    expect(screen.getByText("Section not found: banana")).toBeInTheDocument();
    expect(screen.getByText("Available sections:")).toBeInTheDocument();
  });
});
