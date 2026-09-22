import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SoundProvider } from "@/lib/sound";
import { renderWithIntl } from "@/test/renderWithIntl";
import { LanguageSwitcher } from "./LanguageSwitcher";

const replace = vi.fn();

vi.mock("next/navigation", async (importActual) => ({
  ...(await importActual<typeof import("next/navigation")>()),
  useRouter: () => ({ replace }),
}));

vi.mock("@/i18n/navigation", async (importActual) => ({
  ...(await importActual<typeof import("@/i18n/navigation")>()),
  usePathname: () => "/",
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
    document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
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
    expect(replace).toHaveBeenCalledWith("/en", { scroll: false });
    expect(document.cookie).toContain("NEXT_LOCALE=en");
  });

  it("switches back to Portuguese from English", async () => {
    renderSwitcher("en");
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Português (Brasil)" }));
    expect(replace).toHaveBeenCalledWith("/", { scroll: false });
    expect(document.cookie).toContain("NEXT_LOCALE=pt-BR");
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
