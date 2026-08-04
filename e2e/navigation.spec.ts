import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("desktop nav links scroll to their sections", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop-only nav bar");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Contato" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole("heading", { name: "Vamos conversar" })).toBeInViewport();
  });

  test("mobile menu opens and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only menu");
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("navigation", { name: "Navegação principal (mobile)" })
      .getByRole("link", { name: "Sobre" })
      .click();
    await expect(page).toHaveURL(/#about$/);
  });
});
