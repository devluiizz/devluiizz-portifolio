import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SoundProvider } from "@/lib/sound";
import { renderWithIntl } from "@/test/renderWithIntl";
import { LanguageSwitcher } from "./LanguageSwitcher";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace }),
}));

function renderSwitcher(locale: "pt-BR" | "en") {
  return renderWithIntl(
    <SoundProvider>
      <LanguageSwitcher />
    </SoundProvider>,
    locale,
  );
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("exposes a labelled group with the current locale pressed", () => {
    renderSwitcher("pt-BR");
    expect(screen.getByRole("group", { name: "Idioma" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Português (Brasil)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches to English keeping the current path and scroll position", async () => {
    renderSwitcher("pt-BR");
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    expect(replace).toHaveBeenCalledWith("/", { locale: "en", scroll: false });
  });

  it("switches back to Portuguese from English", async () => {
    renderSwitcher("en");
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Português (Brasil)" }));
    expect(replace).toHaveBeenCalledWith("/", { locale: "pt-BR", scroll: false });
  });

  it("does nothing when the active locale is selected again", async () => {
    renderSwitcher("en");
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    expect(replace).not.toHaveBeenCalled();
  });

  it("works from the keyboard with Enter and Space", async () => {
    renderSwitcher("pt-BR");
    screen.getByRole("button", { name: "English" }).focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(replace).toHaveBeenCalledTimes(2);
  });
});
