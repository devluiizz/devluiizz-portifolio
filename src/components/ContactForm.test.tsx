import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/test/renderWithIntl";
import type { ContactResult } from "@/lib/contact/actions";
import { ContactForm } from "./ContactForm";

const submitContact = vi.fn<(input: unknown) => Promise<ContactResult>>();

vi.mock("@/lib/contact/actions", () => ({
  submitContact: (input: unknown) => submitContact(input),
}));

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/Seu nome/), "Maria Souza");
  await userEvent.type(screen.getByLabelText(/Seu e-mail/), "maria@exemplo.com");
  await userEvent.type(
    screen.getByLabelText(/A ideia/),
    "Quero conversar sobre um sistema de agendamento.",
  );
}

describe("ContactForm", () => {
  beforeEach(() => {
    submitContact.mockReset();
  });

  it("shows friendly, accessible errors and focuses the first invalid field", async () => {
    renderWithIntl(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    const name = screen.getByLabelText(/Seu nome/);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Diga como posso te chamar.");
    expect(name).toHaveFocus();
    expect(
      screen.getByText("Informe seu e-mail para eu poder responder."),
    ).toBeInTheDocument();
    expect(submitContact).not.toHaveBeenCalled();
  });

  it("validates the email format and the minimum message length", async () => {
    renderWithIntl(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/Seu nome/), "Maria");
    await userEvent.type(screen.getByLabelText(/Seu e-mail/), "maria@");
    await userEvent.type(screen.getByLabelText(/A ideia/), "curta");
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    expect(screen.getByText("Digite um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("Escreva pelo menos 20 caracteres.")).toBeInTheDocument();
    expect(submitContact).not.toHaveBeenCalled();
  });

  it("sends once while a submission is in flight and shows the pending state", async () => {
    let resolve: (result: ContactResult) => void = () => {};
    submitContact.mockReturnValue(new Promise((done) => (resolve = done)));
    renderWithIntl(<ContactForm />);
    await fillValidForm();

    const form = screen.getByRole("button", { name: /Enviar mensagem/ }).closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(submitContact).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("button", { name: /Enviando/ })).toBeDisabled();

    resolve({ status: "unavailable" });
    expect(
      await screen.findByText("O envio pelo formulário ainda não está ativo"),
    ).toBeInTheDocument();
  });

  it("keeps the message when delivery is not available", async () => {
    submitContact.mockResolvedValue({ status: "unavailable" });
    renderWithIntl(<ContactForm />);
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Sua mensagem continua aqui",
    );
    expect(screen.getByLabelText(/Seu nome/)).toHaveValue("Maria Souza");
  });

  it("clears the form only after a confirmed delivery", async () => {
    submitContact.mockResolvedValue({ status: "sent" });
    renderWithIntl(<ContactForm />);
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    expect(await screen.findByText("Mensagem enviada!")).toBeInTheDocument();
    expect(screen.getByLabelText(/Seu nome/)).toHaveValue("");
  });

  it("shows a friendly error when the request fails", async () => {
    submitContact.mockRejectedValue(new Error("network down"));
    renderWithIntl(<ContactForm />);
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: /Enviar mensagem/ }));

    expect(await screen.findByText("Não foi possível enviar agora")).toBeInTheDocument();
    expect(screen.queryByText(/network down/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/A ideia/)).toHaveValue(
      "Quero conversar sobre um sistema de agendamento.",
    );
  });

  it("renders in English", async () => {
    renderWithIntl(<ContactForm />, "en");
    await userEvent.click(screen.getByRole("button", { name: /Send message/ }));
    expect(screen.getByText("Let me know what to call you.")).toBeInTheDocument();
    expect(screen.getByText("0/2,000")).toBeInTheDocument();
  });
});
