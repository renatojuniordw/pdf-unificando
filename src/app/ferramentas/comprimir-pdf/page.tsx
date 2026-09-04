import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { ComprimirPdfClient } from "./ComprimirPdfClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { ToolRichContent } from "@/components/tools/ToolRichContent";
import { JsonLd, generateWebApplicationSchema, generateFAQSchema } from "@/components/seo/JsonLd";

const tool = getTool("comprimir-pdf");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.seoDescription,
  alternates: {
    canonical: `/ferramentas/${tool.slug}`,
  },
  openGraph: {
    title: `${tool.name} Online e Grátis`,
    description: tool.seoDescription,
    type: "website",
  },
};

export default function ComprimirPdfPage() {
  const jsonLd = generateWebApplicationSchema(tool);
  const faqSchema = generateFAQSchema([
    {
      question: "A compressão afeta a leitura do PDF?",
      answer: "Nossa ferramenta utiliza algoritmos inteligentes para reduzir o tamanho removendo dados redundantes. Na qualidade 'Média' ou 'Alta', a diferença visual é imperceptível."
    },
    {
      question: "É seguro enviar meus documentos?",
      answer: "Absolutamente. O processamento ocorre em memória e os arquivos são deletados logo após o uso. Sua privacidade é nossa prioridade número um."
    }
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={faqSchema} />
      
      <section className="bg-[#ccff00] border-b-4 border-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-slate-950 text-[#ccff00] font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000] mb-4">
            FERRAMENTA GRATUITA
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] text-slate-950">
            {tool.name}
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-700 mt-4 max-w-xl">
            {tool.seoDescription}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <PrivacyBanner />
        </div>

        <ComprimirPdfClient />
      </div>


      <ToolRichContent 
        toolName="Comprimir PDF"
        toolSlug="comprimir-pdf"
        description={tool.seoDescription}
        benefits={[
          { title: "Redução Inteligente", text: "Algoritmos avançados que removem dados redundantes sem destruir a legibilidade do texto." },
          { title: "Três Níveis de Peso", text: "Escolha entre compressão Baixa, Média ou Alta dependendo da sua necessidade de tamanho." },
          { title: "Otimização para Web", text: "Transforme PDFs pesados em arquivos leves, ideais para sites e sistemas de gestão." }
        ]}
        useCases={[
          { title: "Envio por E-mail", text: "Reduza arquivos que excedem o limite de anexo dos provedores de e-mail." },
          { title: "Upload em Portais", text: "Muitos sites de órgãos públicos exigem PDFs com tamanho máximo de 2MB ou 5MB." },
          { title: "Economia de Espaço", text: "Otimize seu armazenamento em nuvem ou disco local comprimindo documentos antigos." }
        ]}
        faq={[
          { question: "A compressão afeta a leitura do PDF?", answer: "Nossa ferramenta utiliza algoritmos inteligentes para reduzir o tamanho removendo dados redundantes. Na qualidade 'Média' ou 'Alta', a diferença visual é imperceptível." },
          { question: "É seguro enviar meus documentos?", answer: "Absolutamente. O processamento ocorre em memória e os arquivos são deletados logo após o uso. Sua privacidade é nossa prioridade número um." },
          { question: "O PDF compactado mantém a formatação?", answer: "Sim, a estrutura do documento, as fontes e os elementos de layout permanecem intactos." }
        ]}
        tutorialSlug="como-comprimir-pdf"
      />

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <PrivacyBanner />
      </div>
    </>
  );
}
