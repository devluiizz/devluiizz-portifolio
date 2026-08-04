import { test, expect } from "@playwright/test";

test.describe("Reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("content is fully visible without waiting on animation", async ({ page, isMobile }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await page
        .getByRole("navigation", { name: "Navegação principal (mobile)" })
        .getByRole("link", { name: "Sobre" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Navegação principal" })
        .getByRole("link", { name: "Sobre" })
        .click();
    }

    await expect(page.getByRole("heading", { name: "Como eu trabalho" })).toBeVisible();
  });

  test("no custom cursor is engaged", async ({ page }) => {
    await page.goto("/");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains("cursor-ready")))
      .toBe(false);
  });
});
