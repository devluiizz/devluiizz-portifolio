# Portfolio

Personal software engineering portfolio. Built with Next.js (App Router),
TypeScript, Tailwind CSS, MDX-backed project content, and GSAP for scroll
motion.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Project case studies live in `content/projects/*.mdx` and are validated
against the schema in `src/lib/content/schema.ts`. Site-wide copy (name,
role, contact links) lives in `src/content/site.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run format` | Prettier, write |
| `npm test` | Unit/component tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4, theme tokens as CSS custom properties (light/dark)
- MDX + Zod for typed project content
- GSAP + ScrollTrigger for scroll-based motion
- Vitest + Testing Library, Playwright for e2e
