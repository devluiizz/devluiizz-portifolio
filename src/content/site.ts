export type NavKey = "home" | "experience" | "projects" | "about" | "contact";

export interface NavItem {
  key: NavKey;
  href: string;
}

// Translatable copy (role, positioning, labels) lives in messages/*.json.
export const siteConfig = {
  name: "Luiz Felipe",
  location: "",
  email: "luiizz.oliveira02@outlook.com",
  github: "https://github.com/devluiizz",
  linkedin: "https://br.linkedin.com/in/luiz-felipe-de-oliveira-",
} as const;

export const navItems: NavItem[] = [
  { key: "home", href: "#home" },
  { key: "experience", href: "#experience" },
  { key: "projects", href: "#projects" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
];
