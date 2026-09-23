export type NavKey =
  "home" | "experience" | "projects" | "about" | "terminal" | "contact";

export interface NavItem {
  key: NavKey;
  // Home sections are "/#id" so they also work from other pages; other entries are routes.
  href: `/#${string}` | `/${string}`;
}

const INSTAGRAM_HANDLE = "hey.luiizz";
// International format, digits only (country code + area code + number).
const WHATSAPP_NUMBER = "5535996715651";

// Translatable copy (role, positioning, labels) lives in messages/*.json.
export const siteConfig = {
  name: "Luiz Felipe",
  location: "",
  email: "luiizz.oliveira02@outlook.com",
  github: "https://github.com/devluiizz",
  linkedin: "https://br.linkedin.com/in/luiz-felipe-de-oliveira-",
  // Destinations are the same in every locale, so the QR codes never change.
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
} as const;

export const navItems: NavItem[] = [
  { key: "home", href: "/#home" },
  { key: "experience", href: "/#experience" },
  { key: "projects", href: "/#projects" },
  { key: "about", href: "/#about" },
  { key: "terminal", href: "/#terminal" },
  { key: "contact", href: "/#contact" },
];
