import type { Locale } from "@/i18n/routing";
import {
  experienceSchema,
  type Experience,
  type ExperienceEntry,
} from "@/lib/content/schema";

const rawExperiences = [
  {
    company: "Atrio Imóveis",
    role: {
      "pt-BR": "Desenvolvedor de Sistemas de Tecnologia da Informação",
      en: "IT Systems Developer",
    },
    startDate: "2026-06",
    endDate: null,
    description: {
      "pt-BR":
        "Desenvolvimento de um novo sistema imobiliário interno para gestão de clientes, contratos, imóveis, locação e venda, e corretores — parte de uma arquitetura que hoje integra dados vindos do Superlógica e um chatbot de WhatsApp para envio automatizado de mensagens e requisições.",
      en: "Building a new internal real estate system to manage clients, contracts, properties, rentals and sales, and agents — part of an architecture that currently brings in data from Superlógica and a WhatsApp chatbot for automated messages and requests.",
    },
    stack: [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "PostgreSQL",
      "JWT",
      "Zod",
      "Puppeteer",
      "Vercel",
    ],
    highlights: {
      "pt-BR": [
        "APIs REST em camadas (routes → controllers → services) com autenticação JWT e cookies httpOnly.",
        "Geração de documentos (contratos em .docx, boletos e relatórios em PDF) e leitura/geração de QR Code.",
        "Migração de dados de Firestore para PostgreSQL em produção, sem downtime.",
        "Design system componentizado com tokens de cor/tipografia e suporte a dark mode.",
      ],
      en: [
        "Layered REST APIs (routes → controllers → services) with JWT authentication and httpOnly cookies.",
        "Document generation (.docx contracts, boleto payment slips and PDF reports) plus QR code reading and generation.",
        "Production data migration from Firestore to PostgreSQL with zero downtime.",
        "Component-based design system with color and typography tokens and dark mode support.",
      ],
    },
  },
];

const experienceEntries: ExperienceEntry[] = experienceSchema
  .array()
  .parse(rawExperiences);

export function getExperiences(locale: Locale): Experience[] {
  return experienceEntries.map((entry) => ({
    ...entry,
    role: entry.role[locale],
    description: entry.description[locale],
    highlights: entry.highlights[locale],
  }));
}
