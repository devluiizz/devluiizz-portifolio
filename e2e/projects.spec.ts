import { test, expect } from "@playwright/test";

test.describe("Projects section", () => {
  test("shows either project cards or the empty state, never a broken layout", async ({
    page,
  }) => {
    await page.goto("/#projects");
    const section = page.getByRole("region", { name: "O que eu construí" });
    await expect(section).toBeVisible();

    const cards = section.getByRole("heading", { level: 3 });
    const emptyState = section.getByText("Nenhum projeto publicado ainda.");

    const cardCount = await cards.count();
    if (cardCount === 0) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(cards.first()).toBeVisible();
    }
  });

  test("external project links open safely in a new tab", async ({ page }) => {
    await page.goto("/#projects");
    const externalLinks = page.locator('#projects a[target="_blank"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i += 1) {
      await expect(externalLinks.nth(i)).toHaveAttribute("rel", /noopener/);
      await expect(externalLinks.nth(i)).toHaveAttribute("rel", /noreferrer/);
    }
  });
});
