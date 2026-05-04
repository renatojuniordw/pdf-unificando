import type { ToolDefinition } from "@/types/tools";

export const tools: ToolDefinition[] = [
  {
    slug: "comprimir-pdf",
    name: "Comprimir PDF",
    description: "Reduza o tamanho do PDF mantendo a qualidade.",
    seoDescription:
      "Comprima PDFs online grátis, sem cadastro. Seus arquivos não são armazenados.",
    icon: "compress",
    tier: 1,
    accept: [".pdf"],
    multiple: false,
    usesBinary: true,
  },
  {
    slug: "juntar-pdf",
    name: "Juntar PDF",
    description: "Una vários PDFs em um único arquivo.",
    seoDescription:
      "Junte múltiplos PDFs online grátis. Reordene e combine sem limites.",
    icon: "merge",
    tier: 1,
    accept: [".pdf"],
    multiple: true,
    usesBinary: false,
  },
  {
    slug: "dividir-pdf",
    name: "Dividir PDF",
    description: "Extraia páginas ou intervalos de um PDF.",
    seoDescription: "Divida PDFs por intervalo de páginas online grátis.",
    icon: "split",
    tier: 1,
    accept: [".pdf"],
    multiple: false,
    usesBinary: false,
  },
  {
    slug: "pdf-para-word",
    name: "PDF para Word",
    description: "Converta PDF em documento Word editável.",
    seoDescription:
      "Converta PDF para Word (.docx) online grátis. Mantém formatação.",
    icon: "pdf-to-word",
    tier: 1,
    accept: [".pdf"],
    multiple: false,
    usesBinary: true,
  },
  {
    slug: 'pdf-para-jpg',
    name: 'PDF para JPG',
    description: 'Converta páginas do PDF em imagens JPG.',
    seoDescription: 'Converta PDF para JPG online grátis. Escolha resolução em DPI.',
    icon: 'pdf-to-jpg',
    tier: 1,
    accept: ['.pdf'],
    multiple: false,
    usesBinary: true,
  },
  {
    slug: "jpg-para-pdf",
    name: "JPG para PDF",
    description: "Una suas imagens em um único PDF.",
    seoDescription: "Converta imagens JPG para PDF online grátis.",
    icon: "jpg-to-pdf",
    tier: 1,
    accept: [".jpg", ".jpeg", ".png"],
    multiple: true,
    usesBinary: false,
  },
  {
    slug: "rodar-pdf",
    name: "Rodar PDF",
    description: "Gire páginas do PDF em qualquer ângulo.",
    seoDescription: "Rotacione páginas de PDF online grátis.",
    icon: "rotate",
    tier: 1,
    accept: [".pdf"],
    multiple: false,
    usesBinary: false,
  },
  {
    slug: "organizar-pdf",
    name: "Organizar PDF",
    description: "Reordene ou exclua páginas do PDF.",
    seoDescription: "Reordene páginas de PDF online grátis com drag & drop.",
    icon: "organize",
    tier: 1,
    accept: [".pdf"],
    multiple: false,
    usesBinary: false,
  },
];

export function getTool(slug: string): ToolDefinition {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Tool not found: ${slug}`);
  return tool;
}
