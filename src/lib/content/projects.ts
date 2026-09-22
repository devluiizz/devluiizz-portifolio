import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { routing, type Locale } from "@/i18n/routing";
import { projectFrontmatterSchema, type Project } from "./schema";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function readProjectFiles(locale: Locale): string[] {
  try {
    return readdirSync(path.join(PROJECTS_DIR, locale)).filter((file) =>
      file.endsWith(".mdx"),
    );
  } catch {
    return [];
  }
}

function loadProject(locale: Locale, fileName: string): Project {
  const filePath = path.join(PROJECTS_DIR, locale, fileName);
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = projectFrontmatterSchema.parse(data);
  return { ...frontmatter, content };
}

// A project without a translation for the requested locale falls back to the
// default-locale file instead of disappearing from the list.
export function getAllProjects(locale: Locale): Project[] {
  const localized = new Set(readProjectFiles(locale));
  const fallback =
    locale === routing.defaultLocale
      ? []
      : readProjectFiles(routing.defaultLocale).filter((file) => !localized.has(file));

  return [
    ...[...localized].map((file) => loadProject(locale, file)),
    ...fallback.map((file) => loadProject(routing.defaultLocale, file)),
  ].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.order - b.order;
  });
}

export function getProjectBySlug(slug: string, locale: Locale): Project | undefined {
  return getAllProjects(locale).find((project) => project.slug === slug);
}

export function getFeaturedProjects(locale: Locale): Project[] {
  return getAllProjects(locale).filter((project) => project.featured);
}

export function getSecondaryProjects(locale: Locale): Project[] {
  return getAllProjects(locale).filter((project) => !project.featured);
}
