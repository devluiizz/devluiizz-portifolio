import { useTranslations } from "next-intl";
import { siteConfig } from "@/content/site";
import { Reveal } from "./Reveal";

export function Contact() {
  const t = useTranslations("contact");
  const links = [
    {
      label: t("email"),
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
      external: false,
    },
    {
      label: "GitHub",
      value: siteConfig.github.replace("https://", ""),
      href: siteConfig.github,
      external: true,
    },
    {
      label: "LinkedIn",
      value: siteConfig.linkedin.replace("https://", ""),
      href: siteConfig.linkedin,
      external: true,
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          {t("eyebrow")}
        </span>
        <h2
          id="contact-heading"
          className="font-display mt-3 max-w-xl text-balance text-3xl font-medium tracking-tight text-text sm:text-4xl"
        >
          {t("title")}
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-text-muted">
          {t("description")}
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                data-cursor-hover
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/60"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  {link.label}
                </span>
                <span className="mt-2 block truncate text-sm font-medium text-text">
                  {link.value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
