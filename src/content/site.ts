export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Luiz Felipe",
  role: "Desenvolvimento web",
  studentNote: "Estudante de Engenharia de Software",
  positioning:
    "Desenvolvo aplicações web unindo engenharia sólida e design de interface cuidadoso — não só para funcionar, mas para ter arquitetura clara, organização e uma experiência agradável de usar.",
  location: "",
  email: "luiizz.oliveira02@outlook.com",
  github: "https://github.com/devluiizz",
  linkedin: "https://br.linkedin.com/in/luiz-felipe-de-oliveira-",
} as const;

export const navItems: NavItem[] = [
  { label: "Início", href: "#home" },
  { label: "Trajetória", href: "#experience" },
  { label: "Projetos", href: "#projects" },
  { label: "Sobre", href: "#about" },
  { label: "Contato", href: "#contact" },
];
