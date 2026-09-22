import type { Messages } from "next-intl";
import { routing, type Locale } from "./routing";

type MessageTree = { [key: string]: string | MessageTree };

function mergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    result[key] =
      typeof value === "object" && typeof baseValue === "object"
        ? mergeMessages(baseValue, value)
        : value;
  }
  return result;
}

async function importMessages(locale: Locale): Promise<MessageTree> {
  return (await import(`../../messages/${locale}.json`)).default;
}

// Non-default locales are layered over the default one, so a key missing from a
// translation renders the pt-BR text instead of an internal key.
export async function loadMessages(locale: Locale): Promise<Messages> {
  const base = await importMessages(routing.defaultLocale);
  if (locale === routing.defaultLocale) return base as Messages;
  return mergeMessages(base, await importMessages(locale)) as Messages;
}
