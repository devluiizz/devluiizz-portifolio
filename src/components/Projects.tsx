import { getFeaturedProjects, getSecondaryProjects } from "@/lib/content/projects";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

export function Projects() {
  const featured = getFeaturedProjects();
  const secondary = getSecondaryProjects();
  const isEmpty = featured.length === 0 && secondary.length === 0;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Projetos
        </span>
        <h2
          id="projects-heading"
          className="font-display mt-3 max-w-xl text-balance text-3xl font-medium tracking-tight text-text sm:text-4xl"
        >
          O que eu construí
        </h2>
      </Reveal>

      {isEmpty ? (
        <Reveal delay={0.05}>
          <p className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
            Nenhum projeto publicado ainda.
          </p>
        </Reveal>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {featured.map((project, index) => (
                <Reveal key={project.slug} delay={index * 0.05}>
                  <ProjectCard project={project} featured />
                </Reveal>
              ))}
            </div>
          )}

          {secondary.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((project, index) => (
                <Reveal key={project.slug} delay={index * 0.05}>
                  <ProjectCard project={project} featured={false} />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
