import { test, expect, type Page } from "@playwright/test";

async function openThemeToggle(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole("button", { name: "Abrir menu" }).click();
  }
  return page.getByRole("button", { name: /ativar tema/i });
}

test.describe("Theme", () => {
  test("toggles and persists across reload", async ({ page, isMobile }) => {
    await page.goto("/");
    const html = page.locator("html");
    const initial = await html.getAttribute("data-theme");

    const toggle = await openThemeToggle(page, isMobile);
    await toggle.click();
    const toggled = await html.getAttribute("data-theme");
    expect(toggled).not.toBe(initial);

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", toggled ?? "");
  });

  test("has no flash of unstyled theme on load", async ({ page }) => {
    await page.goto("/");
    const dataTheme = await page.locator("html").getAttribute("data-theme");
    expect(["light", "dark"]).toContain(dataTheme);
  });
});
