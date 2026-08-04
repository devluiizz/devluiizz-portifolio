export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Your Name",
  role: "Software Engineer",
  studentNote: "Software Engineering student",
  positioning: "I build fast, well-structured interfaces for products that need to ship.",
  location: "",
  email: "hello@example.com",
  github: "https://github.com/yourusername",
  linkedin: "https://linkedin.com/in/yourusername",
} as const;

export const navItems: NavItem[] = [
  { label: "Início", href: "#home" },
  { label: "Projetos", href: "#projects" },
  { label: "Sobre", href: "#about" },
  { label: "Contato", href: "#contact" },
];
