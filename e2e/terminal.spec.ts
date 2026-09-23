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

  test("treats unsafe input as unknown commands and never executes it", async ({
    page,
  }) => {
    let dialogs = 0;
    page.on("dialog", async (dialog) => {
      dialogs += 1;
      await dialog.dismiss();
    });
    const input = await gotoTerminal(page);

    for (const command of [
      "<script>alert(1)</script>",
      "<img src=x onerror=alert(1)>",
      "eval(alert(1))",
      "rm -rf /",
      "sudo",
    ]) {
      await input.fill(command);
      await input.press("Enter");
    }

    const log = page.getByRole("log", { name: "Comandos digitados" });
    await expect(log.getByText(/^Comando não encontrado:/)).toHaveCount(5);
    await expect(
      page.locator(".terminal-screen img, .terminal-screen script"),
    ).toHaveCount(0);
    expect(dialogs).toBe(0);
  });

  test("help lists the commands and keeps the prompt focused", async ({ page }) => {
    const input = await gotoTerminal(page);
    await input.fill("HELP");
    await input.press("Enter");

    const log = page.getByRole("log", { name: "Comandos digitados" });
    await expect(log.getByText("Navegação", { exact: true })).toBeVisible();
    await expect(log.getByText("Sistema", { exact: true })).toBeVisible();
    await expect(log.getByText("theme", { exact: true })).toBeVisible();
    await expect(input).toBeFocused();
  });

  test("goto scrolls to a real section", async ({ page }) => {
    const input = await gotoTerminal(page);
    await input.fill("goto projetos");
    await input.press("Enter");

    await expect(page).toHaveURL(/#projects$/);
    await expect(
      page.getByRole("heading", { name: "O que eu construí" }),
    ).toBeInViewport();
  });

  test("goto lists sections when the target does not exist", async ({ page }) => {
    const input = await gotoTerminal(page);
    await input.fill("goto banana");
    await input.press("Enter");

    await expect(page.getByText("Seção não encontrada: banana")).toBeVisible();
    await expect(page.getByText("Seções disponíveis:")).toBeVisible();
    await expect(page).toHaveURL(/#terminal$/);
  });

  test("theme uses the site theme and stays in sync with the toggle", async ({
    page,
    isMobile,
  }) => {
    const input = await gotoTerminal(page);
    await input.fill("theme dark");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    if (isMobile) await page.getByRole("button", { name: "Abrir menu" }).click();
    await page.getByRole("button", { name: "Ativar tema claro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    if (isMobile) await page.getByRole("button", { name: "Fechar menu" }).click();

    await input.fill("theme");
    await input.press("Enter");
    await expect(page.getByText("Tema atual: light")).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("clear empties the screen and exit leaves the terminal", async ({ page }) => {
    const input = await gotoTerminal(page);
    for (const command of ["date", "uptime", "clear"]) {
      await input.fill(command);
      await input.press("Enter");
    }
    const log = page.getByRole("log", { name: "Comandos digitados" });
    await expect(log.getByRole("listitem")).toHaveCount(0);

    await input.fill("exit");
    await input.press("Enter");
    await expect(page).toHaveURL(/#home$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
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
