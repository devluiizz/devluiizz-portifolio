import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

const FACTS = ["focus", "education", "approach"] as const;

export function About() {
  const t = useTranslations("about");

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          {t("eyebrow")}
        </span>
        <h2
          id="about-heading"
          className="font-display mt-3 max-w-xl text-balance text-3xl font-medium tracking-tight text-text sm:text-4xl"
        >
          {t("title")}
        </h2>
      </Reveal>

      <div className="mt-8 grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <Reveal delay={0.05}>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-text-muted">
            <p>{t("body.intro")}</p>
            <p>{t("body.study")}</p>
            <p>{t("body.approach")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6">
            {FACTS.map((fact) => (
              <div key={fact}>
                <dt className="font-mono text-xs uppercase tracking-widest text-text-muted">
                  {t(`facts.${fact}.label`)}
                </dt>
                <dd className="mt-1 text-sm text-text">{t(`facts.${fact}.value`)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
