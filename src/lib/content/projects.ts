import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { projectFrontmatterSchema, type Project } from "./schema";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function readProjectFiles(): string[] {
  try {
    return readdirSync(PROJECTS_DIR).filter((file) => file.endsWith(".mdx"));
  } catch {
    return [];
  }
}

function loadProject(fileName: string): Project {
  const filePath = path.join(PROJECTS_DIR, fileName);
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const frontmatter = projectFrontmatterSchema.parse(data);
  return { ...frontmatter, content };
}

export function getAllProjects(): Project[] {
  return readProjectFiles()
    .map(loadProject)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order;
    });
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.featured);
}

export function getSecondaryProjects(): Project[] {
  return getAllProjects().filter((project) => !project.featured);
}
