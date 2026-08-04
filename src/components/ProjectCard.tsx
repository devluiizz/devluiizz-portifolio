"use client";

import { useRef, useState } from "react";
import type { Project } from "@/lib/content/schema";
import { ProjectMediaLightbox } from "./ProjectMediaLightbox";

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "No ar",
  "in-progress": "Em andamento",
  archived: "Arquivado",
};

const STATUS_CLASS: Record<Project["status"], string> = {
  live: "bg-success/15 text-success",
  "in-progress": "bg-warning/15 text-warning",
  archived: "bg-disabled/40 text-disabled-text",
};

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-hover
      className="text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
    >
      {label}
    </a>
  );
}

export function ProjectCard({ project, featured }: { project: Project; featured: boolean }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hasMedia = project.media.length > 0;

  function closeLightbox() {
    setLightboxOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <article
      className={`rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent/60 ${
        featured ? "sm:p-8" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-medium tracking-tight text-text">
          {project.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-text-muted">{project.summary}</p>

      {featured && (
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          <span className="font-medium text-text">Problema: </span>
          {project.problem}
        </p>
      )}

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tecnologias utilizadas">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="font-mono rounded-md border border-border px-2 py-1 text-xs text-text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      {featured && project.highlights.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2 text-sm leading-relaxed text-text-muted">
              <span aria-hidden="true" className="text-accent">
                &rarr;
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-5">
        {project.demoUrl && <ExternalLink href={project.demoUrl} label="Demo" />}
        {project.repoUrl && <ExternalLink href={project.repoUrl} label="Repositório" />}
        {hasMedia && (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setLightboxOpen(true)}
            data-cursor-hover
            className="text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
          >
            Ver mídia do projeto ({project.media.length})
          </button>
        )}
      </div>

      {lightboxOpen && (
        <ProjectMediaLightbox
          media={project.media}
          index={mediaIndex}
          onIndexChange={setMediaIndex}
          onClose={closeLightbox}
          projectTitle={project.title}
        />
      )}
    </article>
  );
}
