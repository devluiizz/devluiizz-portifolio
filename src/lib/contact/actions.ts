"use server";

import { validateContact, type ContactErrors, type ContactInput } from "./schema";

export type ContactResult =
  | { status: "sent" }
  | { status: "invalid"; errors: ContactErrors }
  | { status: "unavailable" }
  | { status: "error" };

interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  /** Honeypot: hidden from people, so only bots fill it in. */
  website: string;
}

// No mail provider is configured yet, so delivery is intentionally disabled.
// Plug one in here (credentials from server-only environment variables).
async function deliver(message: ContactInput): Promise<"sent" | "unavailable"> {
  void message;
  return "unavailable";
}

// Server actions are public endpoints: the payload is untrusted, whatever its type says.
function field(submission: unknown, key: keyof ContactSubmission): string {
  if (typeof submission !== "object" || submission === null) return "";
  const value = (submission as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export async function submitContact(
  submission: ContactSubmission,
): Promise<ContactResult> {
  // Bots that fill the honeypot get a normal-looking answer and nothing is sent.
  if (field(submission, "website").trim() !== "") return { status: "sent" };

  const validation = validateContact({
    name: field(submission, "name"),
    email: field(submission, "email"),
    message: field(submission, "message"),
  });
  if (!validation.success) return { status: "invalid", errors: validation.errors };

  try {
    return { status: await deliver(validation.data) };
  } catch {
    return { status: "error" };
  }
}
