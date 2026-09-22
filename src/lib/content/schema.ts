import { z } from "zod";

export const projectStatusValues = ["live", "in-progress", "archived"] as const;

export const projectMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().min(1),
  alt: z.string().min(1),
});

export type ProjectMedia = z.infer<typeof projectMediaSchema>;

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  problem: z.string().min(1),
  role: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  status: z.enum(projectStatusValues),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  demoUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  highlights: z.array(z.string().min(1)).default([]),
  learnings: z.array(z.string().min(1)).default([]),
  media: z.array(projectMediaSchema).default([]),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export interface Project extends ProjectFrontmatter {
  content: string;
}

// Every supported locale is required, so a missing translation fails validation.
function localized<T extends z.ZodType>(schema: T) {
  return z.object({ "pt-BR": schema, en: schema });
}

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: localized(z.string().min(1)),
  startDate: z.string().min(1),
  endDate: z.string().nullable(),
  description: localized(z.string().min(1)),
  stack: z.array(z.string().min(1)).min(1),
  highlights: localized(z.array(z.string().min(1))).default({ "pt-BR": [], en: [] }),
});

export type ExperienceEntry = z.infer<typeof experienceSchema>;

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string;
  stack: string[];
  highlights: string[];
}
