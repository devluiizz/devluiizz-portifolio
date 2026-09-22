import { test, expect, type Page } from "@playwright/test";

async function gotoTerminal(page: Page) {
  await page.goto("/#terminal");
  const input = page.getByRole("textbox", { name: "Comando do terminal" });
  await input.scrollIntoViewIfNeeded();
  await input.click();
  return input;
}

test.describe("Terminal", () => {
  test("is listed right before Contato in the navigation", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Abrir menu" }).click();
    const nav = page.getByRole("navigation", {
      name: isMobile ? "Navegação principal (mobile)" : "Navegação principal",
    });
    const labels = (await nav.getByRole("link").allInnerTexts()).map((label) =>
      label.split("\n")[0].trim(),
    );
    expect(labels.slice(-2)).toEqual(["Terminal", "Contato"]);
  });

  test("sits right above the contact section", async ({ page }) => {
    await page.goto("/");
    const ids = await page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((section) => section.id));
    expect(ids.slice(-2)).toEqual(["terminal", "contact"]);
  });

  test("the nav item scrolls to the terminal on the same page", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("link", { name: "Terminal" }).first().click();

    await expect(page).toHaveURL(/\/#terminal$/);
    await expect(page.getByText(/BASH \/\/ DEVLUIIZZ\.EXE/)).toBeInViewport();
    await expect(page.getByText("DEVLUIIZZ OS v2.0", { exact: true })).toBeVisible();
  });

  test("echoes typed commands without executing them", async ({ page }) => {
    let dialogs = 0;
    page.on("dialog", async (dialog) => {
      dialogs += 1;
      await dialog.dismiss();
    });
    const input = await gotoTerminal(page);

    for (const command of ["ajuda", "alert(1)", "<img src=x onerror=alert(1)>"]) {
      await input.fill(command);
      await input.press("Enter");
    }

    const log = page.getByRole("log", { name: "Comandos digitados" });
    await expect(log.getByRole("listitem")).toHaveCount(3);
    await expect(log.getByRole("listitem").nth(2)).toContainText(
      "<img src=x onerror=alert(1)>",
    );
    await expect(page.locator(".terminal-screen img")).toHaveCount(0);
    expect(dialogs).toBe(0);
  });

  test("scrolls to keep the prompt visible after many commands", async ({ page }) => {
    const input = await gotoTerminal(page);
    for (let i = 0; i < 30; i += 1) {
      await input.fill(`comando-${i}`);
      await input.press("Enter");
    }
    await expect(input).toBeInViewport();
    const scrollTop = await page
      .locator(".terminal-screen")
      .evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);
  });

  test("is translated in English", async ({ page }) => {
    await page.goto("/en#terminal");
    await expect(page.getByRole("textbox", { name: "Terminal command" })).toBeAttached();
    await expect(page.getByText("All rights reserved.", { exact: false })).toBeAttached();
  });

  test("does not overflow horizontally", async ({ page }) => {
    await page.goto("/#terminal");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});
