import { z } from "zod";

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  messageMin: 20,
  messageMax: 2000,
} as const;

export type ContactField = "name" | "email" | "message";

// Error "messages" are translation keys under contact.form.errors, so the same
// schema validates in the browser and again on the server.
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "nameRequired" })
    .min(CONTACT_LIMITS.nameMin, { error: "nameTooShort" })
    .max(CONTACT_LIMITS.nameMax, { error: "nameTooLong" }),
  email: z
    .string()
    .trim()
    .min(1, { error: "emailRequired" })
    .max(CONTACT_LIMITS.emailMax, { error: "emailInvalid" })
    .pipe(z.email({ error: "emailInvalid" })),
  message: z
    .string()
    .trim()
    .min(1, { error: "messageRequired" })
    .min(CONTACT_LIMITS.messageMin, { error: "messageTooShort" })
    .max(CONTACT_LIMITS.messageMax, { error: "messageTooLong" }),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactErrorKey =
  | "nameRequired"
  | "nameTooShort"
  | "nameTooLong"
  | "emailRequired"
  | "emailInvalid"
  | "messageRequired"
  | "messageTooShort"
  | "messageTooLong";

export type ContactErrors = Partial<Record<ContactField, ContactErrorKey>>;

export function validateContact(
  values: Record<ContactField, string>,
): { success: true; data: ContactInput } | { success: false; errors: ContactErrors } {
  const result = contactSchema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const errors: ContactErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField;
    errors[field] ??= issue.message as ContactErrorKey;
  }
  return { success: false, errors };
}
