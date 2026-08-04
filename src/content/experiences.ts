import { experienceSchema, type Experience } from "@/lib/content/schema";

const rawExperiences = [
  {
    company: "Atrio Imóveis",
    role: "Desenvolvedor de Sistemas de Tecnologia da Informação",
    startDate: "2026-06",
    endDate: null,
    description:
      "Desenvolvimento de um novo sistema imobiliário interno para gestão de clientes, contratos, imóveis, locação e venda, e corretores — parte de uma arquitetura que hoje integra dados vindos do Superlógica e um chatbot de WhatsApp para envio automatizado de mensagens e requisições.",
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
    highlights: [
      "APIs REST em camadas (routes → controllers → services) com autenticação JWT e cookies httpOnly.",
      "Geração de documentos (contratos em .docx, boletos e relatórios em PDF) e leitura/geração de QR Code.",
      "Migração de dados de Firestore para PostgreSQL em produção, sem downtime.",
      "Design system componentizado com tokens de cor/tipografia e suporte a dark mode.",
    ],
  },
];

export const experiences: Experience[] = experienceSchema.array().parse(rawExperiences);
