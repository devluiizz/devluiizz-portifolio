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

The site is available in Brazilian Portuguese (`/`, default) and English
(`/en`), using [next-intl](https://next-intl.dev). Interface copy lives in
`messages/pt-BR.json` and `messages/en.json`, which must keep the same keys.

Project case studies live in `content/projects/<locale>/*.mdx` and are
validated against the schema in `src/lib/content/schema.ts`; a project without
an English file falls back to the Portuguese one. Experience entries in
`src/content/experiences.ts` carry both languages per field. Non-translatable
site data (name, contact links) lives in `src/content/site.ts`.

The home page includes DEVLUIIZZ OS (`#terminal`, above Contact), a visual terminal. For now it only echoes
what is typed; nothing is executed. Session state lives in
`src/lib/terminal.ts`, which is where command handling will plug in.

Set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical, hreflang
and Open Graph URLs are absolute (on Vercel the production URL is used
automatically).

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
- next-intl for pt-BR/en internationalization
- MDX + Zod for typed project content
- GSAP + ScrollTrigger for scroll-based motion
- Vitest + Testing Library, Playwright for e2e
