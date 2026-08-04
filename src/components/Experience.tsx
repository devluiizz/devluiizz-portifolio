"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experiences } from "@/content/experiences";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Reveal } from "./Reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MONTHS_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatMonthYear(value: string): string {
  const [year, month] = value.split("-");
  return `${MONTHS_PT[Number(month) - 1]}/${year}`;
}

function formatPeriod(startDate: string, endDate: string | null): string {
  const start = formatMonthYear(startDate);
  const end = endDate ? formatMonthYear(endDate) : "atual";
  return `${start} — ${end}`;
}

export function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const track = trackRef.current;
    const line = lineRef.current;
    if (!track || !line) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: track,
            start: "top 70%",
            end: "bottom 80%",
            scrub: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-6xl px-6 py-24"
    >
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Trajetória
        </span>
        <h2
          id="experience-heading"
          className="font-display mt-3 max-w-xl text-balance text-3xl font-medium tracking-tight text-text sm:text-4xl"
        >
          Onde já atuei
        </h2>
      </Reveal>

      <div ref={trackRef} className="relative mt-12">
        <div
          aria-hidden="true"
          className="absolute left-[7px] top-1 bottom-1 w-px bg-border sm:left-[9px]"
        />
        <div
          ref={lineRef}
          aria-hidden="true"
          className="absolute left-[7px] top-1 bottom-1 w-px origin-top bg-accent sm:left-[9px]"
        />

        <ol className="space-y-10">
          {experiences.map((experience, index) => (
            <li
              key={`${experience.company}-${experience.startDate}`}
              className="relative pl-8 sm:pl-10"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-accent bg-bg sm:h-[19px] sm:w-[19px]"
              />
              <Reveal delay={index * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-xl font-medium tracking-tight text-text">
                      {experience.role}
                    </h3>
                    <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
                      {formatPeriod(experience.startDate, experience.endDate)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-accent">{experience.company}</p>
                  <p className="mt-4 text-sm leading-relaxed text-text-muted">
                    {experience.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tecnologias utilizadas">
                    {experience.stack.map((tech) => (
                      <li
                        key={tech}
                        className="font-mono rounded-md border border-border px-2 py-1 text-xs text-text-muted"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>

                  {experience.highlights.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {experience.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex gap-2 text-sm leading-relaxed text-text-muted"
                        >
                          <span aria-hidden="true" className="text-accent">
                            &rarr;
                          </span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
