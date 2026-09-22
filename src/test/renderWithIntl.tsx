import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { Locale } from "@/i18n/routing";
import ptBR from "../../messages/pt-BR.json";
import en from "../../messages/en.json";

const MESSAGES = { "pt-BR": ptBR, en } as const;

export function renderWithIntl(ui: ReactElement, locale: Locale = "pt-BR") {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
      {ui}
    </NextIntlClientProvider>,
  );
}
