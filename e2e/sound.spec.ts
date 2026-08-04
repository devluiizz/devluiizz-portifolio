import { test, expect } from "@playwright/test";

test.describe("Sound preference", () => {
  test("is off by default and persists once enabled", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
    }

    await expect(page.getByRole("button", { name: "Ativar sons da interface" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await page.getByRole("button", { name: "Ativar sons da interface" }).click();
    await expect(page.getByRole("button", { name: "Desativar sons da interface" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.reload();
    if (isMobile) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
    }
    await expect(page.getByRole("button", { name: "Desativar sons da interface" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
