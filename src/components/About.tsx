import { Reveal } from "./Reveal";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Sobre
        </span>
        <h2
          id="about-heading"
          className="font-display mt-3 max-w-xl text-balance text-3xl font-medium tracking-tight text-text sm:text-4xl"
        >
          Como eu trabalho
        </h2>
      </Reveal>

      <div className="mt-8 grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <Reveal delay={0.05}>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-text-muted">
            <p>
              Trabalho na fronteira entre engenharia de backend e interfaces —
              gosto de sistemas que precisam se comportar bem sob carga real,
              e de interfaces que tornam esses sistemas fáceis de entender.
            </p>
            <p>
              Sou estudante de Engenharia de Software e uso os projetos fora
              da sala de aula para testar, na prática, ideias que a faculdade
              só cobre em teoria — arquitetura, consistência de dados,
              performance, acessibilidade.
            </p>
            <p>
              Prefiro soluções simples que resolvem o problema certo a
              abstrações que antecipam problemas que talvez nunca apareçam.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6">
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-text-muted">
                Foco
              </dt>
              <dd className="mt-1 text-sm text-text">Backend &amp; frontend</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-text-muted">
                Formação
              </dt>
              <dd className="mt-1 text-sm text-text">Eng. de Software</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-text-muted">
                Abordagem
              </dt>
              <dd className="mt-1 text-sm text-text">Código simples, testável</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-text-muted">
                Disponibilidade
              </dt>
              <dd className="mt-1 text-sm text-text">Aberto a oportunidades</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
