"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useTranslations } from "next-intl";
import { submitContact } from "@/lib/contact/actions";
import {
  CONTACT_LIMITS,
  validateContact,
  type ContactErrorKey,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact/schema";

type Status = "idle" | "submitting" | "sent" | "unavailable" | "error";

const FIELDS: readonly ContactField[] = ["name", "email", "message"];

const LIMIT_VALUES: Record<ContactField, { min: number; max: number }> = {
  name: { min: CONTACT_LIMITS.nameMin, max: CONTACT_LIMITS.nameMax },
  email: { min: 0, max: CONTACT_LIMITS.emailMax },
  message: { min: CONTACT_LIMITS.messageMin, max: CONTACT_LIMITS.messageMax },
};

const EMPTY: Record<ContactField, string> = { name: "", email: "", message: "" };

const LINE_INPUT_CLASS =
  "contact-field block w-full border-0 border-b border-border bg-transparent px-0 py-3 text-lg text-text placeholder:text-text-muted/60 transition focus:border-accent focus:shadow-[0_1px_0_0_var(--color-accent)] aria-invalid:border-error aria-invalid:focus:shadow-[0_1px_0_0_var(--color-error)]";

const SWIPE_THRESHOLD = 0.85;

function Field({
  id,
  index,
  label,
  error,
  children,
}: {
  id: string;
  index: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const t = useTranslations("contact.form");
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted"
      >
        <span className="mr-2 opacity-60">{index}</span>
        {label}
        <span aria-hidden="true" className="ml-1 text-accent">
          *
        </span>
        <span className="sr-only"> ({t("required")})</span>
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="text-error mt-2 flex items-start gap-1.5 text-sm"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              d="M12 7.5v5.5M12 16.5v.01"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function StatusPanel({ status }: { status: Status }) {
  const t = useTranslations("contact.form.status");
  if (status !== "sent" && status !== "error" && status !== "unavailable") return null;

  const success = status === "sent";
  return (
    <div
      className={`contact-status flex gap-3 rounded-sm border px-4 py-3 text-sm ${
        success ? "border-success/40 bg-success/10" : "border-accent/30 bg-accent-soft"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
          success ? "bg-success" : "bg-accent"
        }`}
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
          {success ? (
            <path
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 12.5 4.5 4.5L19 7.5"
            />
          ) : (
            <path
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              d="M12 6.5v7M12 17.5v.01"
            />
          )}
        </svg>
      </span>
      <div>
        <p className="font-medium text-text">{t(`${status}Title`)}</p>
        <p className="mt-0.5 text-text-muted">{t(status)}</p>
      </div>
    </div>
  );
}

// The handle is a real submit button, so click, Enter and Space all submit;
// dragging it past the threshold is the swipe gesture layered on top.
function SwipeToSend({
  submitting,
  formRef,
}: {
  submitting: boolean;
  formRef: RefObject<HTMLFormElement | null>;
}) {
  const t = useTranslations("contact.form");
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    startX: number;
    max: number;
    offset: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (submitting || !trackRef.current || !handleRef.current) return;
    const max = trackRef.current.clientWidth - handleRef.current.offsetWidth - 8;
    dragRef.current = { startX: event.clientX, max, offset: 0, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    drag.offset = Math.min(Math.max(event.clientX - drag.startX, 0), drag.max);
    if (drag.offset > 4) drag.moved = true;
    setOffset(drag.offset);
    setArmed(drag.offset >= drag.max * SWIPE_THRESHOLD);
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    setArmed(false);
    setOffset(0);
    if (!drag?.moved) return;
    // A drag ends with a click on the handle; swallow it so it doesn't submit twice.
    suppressClickRef.current = true;
    if (drag.offset >= drag.max * SWIPE_THRESHOLD) formRef.current?.requestSubmit();
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
  }

  const label = submitting ? t("submitting") : armed ? t("release") : t("swipe");

  return (
    <div
      ref={trackRef}
      className="relative flex h-14 w-full shrink-0 items-center overflow-hidden rounded-md border border-border bg-bg/60 sm:w-64"
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none flex-1 pl-14 text-center font-mono text-[11px] uppercase tracking-[0.25em] ${
          submitting || armed ? "text-text" : "swipe-label"
        }`}
      >
        {label}
      </span>
      <button
        ref={handleRef}
        type="submit"
        aria-label={submitting ? t("submitting") : t("submit")}
        disabled={submitting}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
        className={`absolute left-1 top-1 flex h-12 w-12 touch-none items-center justify-center rounded-md text-white shadow-md hover:shadow-[0_8px_24px_-8px_var(--color-accent)] disabled:cursor-wait ${
          dragging
            ? "cursor-grabbing"
            : "cursor-grab transition-transform duration-300 ease-out"
        }`}
        style={{
          background: "var(--gradient-accent)",
          transform: `translateX(${offset}px)`,
        }}
      >
        {submitting ? (
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            aria-hidden="true"
            className="animate-spin"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="2.4"
            />
            <path
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              d="M21 12a9 9 0 0 0-9-9"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              d="M4.5 4.5 20 12 4.5 19.5 7 12 4.5 4.5ZM7 12h6"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [values, setValues] = useState(EMPTY);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const controlsRef = useRef<
    Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>
  >({});

  function errorText(field: ContactField, key?: ContactErrorKey) {
    return key ? t(`errors.${key}`, LIMIT_VALUES[field]) : undefined;
  }

  function fieldError(next: Record<ContactField, string>, field: ContactField) {
    const result = validateContact(next);
    return result.success ? undefined : result.errors[field];
  }

  function update(field: ContactField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (status !== "submitting") setStatus("idle");
    if (attempted || errors[field]) {
      setErrors((current) => ({ ...current, [field]: fieldError(next, field) }));
    }
  }

  function handleBlur(field: ContactField) {
    if (values[field].trim() === "" && !attempted) return;
    setErrors((current) => ({ ...current, [field]: fieldError(values, field) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    setAttempted(true);
    const validation = validateContact(values);
    if (!validation.success) {
      setErrors(validation.errors);
      const firstInvalid = FIELDS.find((field) => validation.errors[field]);
      if (firstInvalid) controlsRef.current[firstInvalid]?.focus();
      return;
    }

    submittingRef.current = true;
    setErrors({});
    setStatus("submitting");
    try {
      const result = await submitContact({ ...values, website });
      if (result.status === "invalid") {
        setErrors(result.errors);
        setStatus("idle");
      } else {
        setStatus(result.status);
        // Fields are cleared only once delivery is confirmed.
        if (result.status === "sent") {
          setValues(EMPTY);
          setAttempted(false);
        }
      }
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  const submitting = status === "submitting";
  const describedBy = (field: ContactField, extra?: string) =>
    [errors[field] ? `contact-${field}-error` : null, extra].filter(Boolean).join(" ") ||
    undefined;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
      aria-labelledby="contact-form-heading"
      className="relative flex h-full flex-col rounded-md border border-border bg-bg px-4 py-6 sm:p-8"
    >
      <h3
        id="contact-form-heading"
        className="font-mono text-[11px] uppercase tracking-[0.25em] text-text-muted"
      >
        <span aria-hidden="true" className="mr-2 text-accent">
          ›
        </span>
        {t("eyebrow")}
      </h3>

      <div className="mt-8 flex flex-1 flex-col gap-7">
        <Field
          id="contact-name"
          index="01"
          label={t("name.label")}
          error={errorText("name", errors.name)}
        >
          <input
            ref={(node) => {
              controlsRef.current.name = node;
            }}
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.nameMax}
            placeholder={t("name.placeholder")}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            aria-required="true"
            className={LINE_INPUT_CLASS}
          />
        </Field>

        <Field
          id="contact-email"
          index="02"
          label={t("email.label")}
          error={errorText("email", errors.email)}
        >
          <input
            ref={(node) => {
              controlsRef.current.email = node;
            }}
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.emailMax}
            placeholder={t("email.placeholder")}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            aria-required="true"
            className={LINE_INPUT_CLASS}
          />
        </Field>

        <Field
          id="contact-message"
          index="03"
          label={t("message.label")}
          error={errorText("message", errors.message)}
        >
          <div className="relative mt-3">
            <textarea
              ref={(node) => {
                controlsRef.current.message = node;
              }}
              id="contact-message"
              name="message"
              rows={6}
              maxLength={CONTACT_LIMITS.messageMax}
              placeholder={t("message.placeholder")}
              value={values.message}
              onChange={(event) => update("message", event.target.value)}
              onBlur={() => handleBlur("message")}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy("message", "contact-message-count")}
              aria-required="true"
              className="contact-field block min-h-40 w-full resize-y rounded-sm border border-border bg-transparent px-4 py-3 pb-8 text-base leading-relaxed text-text placeholder:text-text-muted/60 transition [max-height:28rem] focus:border-accent focus:ring-4 focus:ring-accent/15 aria-invalid:border-error aria-invalid:focus:ring-error/15"
            />
            <span
              id="contact-message-count"
              className="pointer-events-none absolute bottom-2.5 right-4 font-mono text-[11px] text-text-muted"
            >
              {t("message.counter", {
                count: values.message.length,
                max: CONTACT_LIMITS.messageMax,
              })}
            </span>
          </div>
        </Field>

        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-px w-px overflow-hidden"
        >
          <label htmlFor="contact-website">{t("honeypot")}</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <div role="status" aria-live="polite">
          <StatusPanel status={status} />
        </div>

        <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-xs items-start gap-2 text-sm leading-relaxed text-text-muted">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            {t("note")}
          </p>
          <SwipeToSend submitting={submitting} formRef={formRef} />
        </div>
      </div>
    </form>
  );
}
