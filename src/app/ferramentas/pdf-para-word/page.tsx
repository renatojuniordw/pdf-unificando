import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { PdfParaWordClient } from "./PdfParaWordClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { ToolRichContent } from "@/components/tools/ToolRichContent";
import { JsonLd, generateWebApplicationSchema, generateBreadcrumbSchema } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const tool = getTool("pdf-para-word");

export const metadata: Metadata = {
  title: tool.seoTitle ?? tool.name,
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

export default function PdfParaWordPage() {
  const jsonLd = generateWebApplicationSchema(tool);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Início", url: siteUrl("/") },
    { name: "Ferramentas", url: siteUrl("/") },
    { name: tool.name, url: siteUrl(`/ferramentas/${tool.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbSchema} />
      
      <section className="bg-[#ccff00] border-b-4 border-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Início", href: "/" },
              { label: tool.name },
            ]}
          />
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

        <PdfParaWordClient />
      </div>


      <ToolRichContent 
        toolName="PDF para Word"
        toolSlug="pdf-para-word"
        description={tool.seoDescription}
        benefits={[
          { title: "Edição Facilitada", text: "Transforme PDFs estáticos em documentos editáveis para correções rápidas e reutilização de conteúdo." },
          { title: "Preservação de Layout", text: "Nosso motor de conversão respeita parágrafos, listas e a estrutura geral do seu documento." },
          { title: "Velocidade de Elite", text: "Conclua conversões complexas em segundos, sem precisar instalar softwares pesados." }
        ]}
        useCases={[
          { title: "Atualização de Currículos", text: "Perdeu o arquivo original do seu CV? Converta o PDF de volta para Word e edite." },
          { title: "Revisão de Contratos", text: "Transforme contratos em PDF para Word para sugerir alterações e revisões." },
          { title: "Tradução de Documentos", text: "Converta para Word para facilitar o uso de ferramentas de tradução e revisão ortográfica." }
        ]}
        faq={[
          { question: "O arquivo Word fica idêntico ao PDF?", answer: "Nosso conversor tenta manter o máximo possível da formatação original. Para PDFs complexos, pequenos ajustes podem ser necessários." },
          { question: "Meus dados estão protegidos?", answer: "Sim. A conversão é feita e o arquivo temporário é deletado imediatamente. Não guardamos cópias dos seus documentos." },
          { question: "Preciso pagar para converter?", answer: "Não. A ferramenta PDF para Word do Unificando PDF é 100% gratuita e ilimitada." }
        ]}
        tutorialSlug="como-converter-pdf-em-word"
      />

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <PrivacyBanner />
      </div>
    </>
  );
}
