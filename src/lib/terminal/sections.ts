import { navItems, type NavKey } from "@/content/site";
import { normalizeToken } from "./parser";

export type SectionId = NavKey;

// The canonical name is the English nav key; Portuguese aliases mirror the nav
// labels so goto works with either language.
const SECTION_ALIASES: Record<SectionId, readonly string[]> = {
  home: ["home", "inicio"],
  experience: ["experience", "trajetoria", "experiencia"],
  projects: ["projects", "projetos"],
  about: ["about", "sobre"],
  terminal: ["terminal"],
  contact: ["contact", "contato"],
};

export const SECTIONS: readonly SectionId[] = navItems.map((item) => item.key);

export function resolveSection(input: string): SectionId | undefined {
  const token = normalizeToken(input);
  return SECTIONS.find((section) => SECTION_ALIASES[section].includes(token));
}

export function sectionElementId(section: SectionId): string {
  const item = navItems.find((navItem) => navItem.key === section);
  return item ? item.href.replace(/^\/#/, "") : section;
}
