import { test, expect, type Page } from "@playwright/test";

function languageButton(page: Page, name: "English" | "Português (Brasil)") {
  return page
    .getByRole("group", { name: /idioma|language/i })
    .getByRole("button", { name });
}

test.describe("Internationalization", () => {
  test("switches pt-BR → en → pt-BR and translates the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByRole("heading", { name: "Onde já atuei" })).toBeAttached();

    await languageButton(page, "English").click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "Where I’ve worked" })).toBeAttached();
    await expect(
      page.getByRole("heading", { name: "IT Systems Developer" }),
    ).toBeAttached();
    await expect(page).toHaveTitle("Luiz Felipe — Web development");

    await languageButton(page, "Português (Brasil)").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");

    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });


  test("persists the chosen language across reloads and new visits", async ({ page }) => {
    await page.goto("/");
    await languageButton(page, "English").click();
    await expect(page).toHaveURL(/\/en$/);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("keeps the active theme when switching language", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("button", { name: /ativar tema/i }).click();
    const theme = await page.locator("html").getAttribute("data-theme");

    await languageButton(page, "English").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme ?? "");
  });

  test("exposes hreflang alternates and a canonical URL", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en$/);
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(
      1,
    );
  });
});

test.describe("Language detection", () => {
  test.describe("with an English browser", () => {
    test.use({ locale: "en-US" });

    test("redirects the first visit to /en", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });

  test.describe("with an unsupported browser language", () => {
    test.use({ locale: "de-DE" });

    test("falls back to pt-BR", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    });
  });
});
