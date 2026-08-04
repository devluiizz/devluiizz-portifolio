import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./theme";
import { SoundProvider } from "./sound";
import { ThemeToggle } from "@/components/ThemeToggle";

function renderToggle() {
  return render(
    <ThemeProvider>
      <SoundProvider>
        <ThemeToggle />
      </SoundProvider>
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("toggles data-theme on the document element and persists the choice", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    renderToggle();

    const button = screen.getByRole("button", { name: /ativar tema escuro/i });
    await userEvent.click(button);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("portfolio-theme")).toBe("dark");
  });
});
