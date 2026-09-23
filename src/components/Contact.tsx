import { useTranslations } from "next-intl";
import { ContactForm } from "./ContactForm";
import { DirectContact } from "./DirectContact";
import { Reveal } from "./Reveal";

export function Contact() {
  const t = useTranslations("contact");

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal className="text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          <span aria-hidden="true" className="mr-2 text-accent">
            ›
          </span>
          {t("eyebrow")}
        </span>
        <h2
          id="contact-heading"
          className="font-display mx-auto mt-4 max-w-3xl text-balance text-4xl font-medium leading-[1.05] tracking-tight text-text sm:text-5xl"
        >
          {t("title")} <span className="text-text-muted block">{t("titleAccent")}</span>
        </h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="-mx-2 mt-12 rounded-lg border border-border bg-card p-2 shadow-[0_40px_90px_-60px_var(--color-accent)] sm:mx-0 sm:p-6 lg:p-10">
          <div className="grid gap-2 sm:gap-6 lg:grid-cols-2 lg:gap-10">
            <DirectContact />
            <ContactForm />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
