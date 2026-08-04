import { siteConfig } from "@/content/site";

export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introdução"
      className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-6 py-24"
    >
      <p
        className="hero-enter font-mono text-sm tracking-wide text-accent"
        style={{ animationDelay: "0ms" }}
      >
        {siteConfig.role} &middot; {siteConfig.studentNote}
      </p>

      <h1
        className="hero-enter font-display mt-5 max-w-3xl text-balance text-5xl font-medium leading-[1.05] tracking-tight text-text sm:text-6xl"
        style={{ animationDelay: "80ms" }}
      >
        {siteConfig.name}
      </h1>

      <p
        className="hero-enter mt-6 max-w-xl text-pretty text-lg leading-relaxed text-text-muted"
        style={{ animationDelay: "160ms" }}
      >
        {siteConfig.positioning}
      </p>

      <div
        className="hero-enter mt-10 flex flex-wrap items-center gap-4"
        style={{ animationDelay: "240ms" }}
      >
        <a
          href="#projects"
          className="rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--gradient-accent)" }}
        >
          Ver projetos
        </a>
        <a
          href="#contact"
          className="rounded-full border border-border px-6 py-3 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
        >
          Contato
        </a>
      </div>
    </section>
  );
}
