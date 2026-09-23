import { test, expect } from "@playwright/test";

test.describe("Contact section", () => {
  test("keeps the #contact anchor used by the nav and the terminal", async ({ page }) => {
    await page.goto("/#terminal");
    const input = page.getByRole("textbox", { name: "Comando do terminal" });
    await input.scrollIntoViewIfNeeded();
    await input.fill("goto contact");
    await input.press("Enter");

    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole("heading", { name: "Vamos conversar" })).toBeInViewport();
  });

  test("offers Instagram and WhatsApp as real, safe external links", async ({ page }) => {
    await page.goto("/#contact");
    const instagram = page.getByRole("link", { name: /^Instagram:/ });
    const whatsapp = page.getByRole("link", { name: /^WhatsApp:/ });

    await expect(instagram).toHaveAttribute(
      "href",
      "https://www.instagram.com/hey.luiizz/",
    );
    await expect(whatsapp).toHaveAttribute("href", "https://wa.me/5535996715651");
    for (const link of [instagram, whatsapp]) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link.locator("svg path").first()).toBeAttached();
    }
  });

  test("validates the form and explains that sending is not active yet", async ({
    page,
  }) => {
    await page.goto("/#contact");
    const submit = page.getByRole("button", { name: /Enviar mensagem/ });
    await submit.scrollIntoViewIfNeeded();
    await submit.click();

    await expect(page.getByLabel(/Seu nome/)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel(/Seu nome/)).toBeFocused();
    await expect(page.getByText("Digite um e-mail válido.")).toHaveCount(0);

    await page.getByLabel(/Seu nome/).fill("Maria Souza");
    await page.getByLabel(/Seu e-mail/).fill("maria@");
    await page
      .getByLabel(/A ideia/)
      .fill("Quero conversar sobre um sistema de agendamento.");
    await submit.click();
    await expect(page.getByText("Digite um e-mail válido.")).toBeVisible();

    await page.getByLabel(/Seu e-mail/).fill("maria@exemplo.com");
    await submit.click();
    await expect(page.getByRole("status")).toContainText(
      "O envio pelo formulário ainda não está ativo",
    );
    await expect(page.getByLabel(/Seu nome/)).toHaveValue("Maria Souza");
  });

  test("is fully translated in English", async ({ page }) => {
    await page.goto("/en#contact");
    await expect(
      page.getByRole("heading", { name: "Allergic to forms?" }),
    ).toBeAttached();
    await page.getByRole("button", { name: /Send message/ }).click();
    await expect(page.getByText("Let me know what to call you.")).toBeVisible();
    await expect(page.getByRole("link", { name: /^WhatsApp/ })).toHaveAttribute(
      "href",
      "https://wa.me/5535996715651",
    );
  });

  test("does not overflow horizontally", async ({ page }) => {
    await page.goto("/#contact");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });

  test("submits with the swipe gesture", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByLabel(/Seu nome/).fill("Maria Souza");
    await page.getByLabel(/Seu e-mail/).fill("maria@exemplo.com");
    await page
      .getByLabel(/A ideia/)
      .fill("Quero conversar sobre um sistema de agendamento.");

    const handle = page.getByRole("button", { name: "Enviar mensagem" });
    await handle.scrollIntoViewIfNeeded();
    const box = (await handle.boundingBox())!;
    const track = (await handle.locator("..").boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(track.x + track.width - 10, box.y + box.height / 2, {
      steps: 12,
    });
    await expect(page.getByText("Solte para enviar")).toBeVisible();
    await page.mouse.up();

    await expect(page.getByRole("status")).toContainText(
      "O envio pelo formulário ainda não está ativo",
    );
  });

  test("a short drag springs back without submitting", async ({ page }) => {
    await page.goto("/#contact");
    const handle = page.getByRole("button", { name: "Enviar mensagem" });
    await handle.scrollIntoViewIfNeeded();
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, {
      steps: 5,
    });
    await page.mouse.up();

    await expect(page.getByLabel(/Seu nome/)).not.toHaveAttribute("aria-invalid", "true");
  });
});
