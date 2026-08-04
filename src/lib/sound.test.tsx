import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SoundProvider } from "./sound";
import { SoundToggle } from "@/components/SoundToggle";

describe("SoundToggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to disabled", () => {
    render(
      <SoundProvider>
        <SoundToggle />
      </SoundProvider>,
    );

    expect(screen.getByRole("button", { name: /ativar sons/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("persists the enabled preference across toggles", async () => {
    render(
      <SoundProvider>
        <SoundToggle />
      </SoundProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: /ativar sons/i }));

    expect(localStorage.getItem("portfolio-sound-enabled")).toBe("true");
    expect(screen.getByRole("button", { name: /desativar sons/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
