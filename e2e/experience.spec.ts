import { test, expect } from "@playwright/test";

test.describe("Trajetória section", () => {
  test("desktop nav link scrolls to the experience section", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop-only nav bar");
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Trajetória" })
      .click();
    await expect(page).toHaveURL(/#experience$/);
    await expect(page.getByRole("heading", { name: "Onde já atuei" })).toBeInViewport();
  });

  test("shows the current role at Atrio Imóveis", async ({ page }) => {
    await page.goto("/#experience");
    const section = page.getByRole("region", { name: "Onde já atuei" });
    await expect(section.getByText("Atrio Imóveis")).toBeVisible();
    await expect(
      section.getByRole("heading", {
        name: "Desenvolvedor de Sistemas de Tecnologia da Informação",
      }),
    ).toBeVisible();
  });
});
