import Link from "next/link";
import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { JuntarPdfClient } from "./JuntarPdfClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { ToolRichContent } from "@/components/tools/ToolRichContent";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";

const tool = getTool("juntar-pdf");

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

export default function JuntarPdfPage() {
  const jsonLd = generateWebApplicationSchema(tool);

  return (
    <>
      <JsonLd data={jsonLd} />
      
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

        <JuntarPdfClient />
      </div>

      <EcosystemSection />

      <ToolRichContent 
        toolName="Juntar PDF"
        toolSlug="juntar-pdf"
        description={tool.seoDescription}
        benefits={[
          { title: "Privacidade Absoluta", text: "Nenhum arquivo é armazenado permanentemente. Processamos e deletamos instantaneamente." },
          { title: "Arrastar e Soltar", text: "Interface intuitiva para organizar a ordem dos arquivos com facilidade." },
          { title: "Sem Limites", text: "Combine quantos arquivos precisar sem pagar nada ou criar conta." }
        ]}
        useCases={[
          { title: "Unificação de Documentos", text: "Ideal para juntar vários capítulos de um livro ou partes de um relatório." },
          { title: "Organização de Portfólios", text: "Combine seus melhores trabalhos em um único arquivo profissional." },
          { title: "Envio por E-mail", text: "Agrupe anexos dispersos em um único PDF para facilitar o envio." }
        ]}
        faq={[
          { question: "É seguro juntar meus PDFs aqui?", answer: "Sim! Utilizamos criptografia SSL e os arquivos são apagados automaticamente após o processamento." },
          { question: "Existe limite de tamanho para unificar?", answer: "Aceitamos arquivos de até 50MB cada para garantir a velocidade e estabilidade do serviço." },
          { question: "Posso mudar a ordem dos arquivos?", answer: "Sim, após o upload você pode arrastar os arquivos para definir a ordem exata da unificação." }
        ]}
        tutorialSlug="como-juntar-pdf"
      />

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <PrivacyBanner />
      </div>
    </>
  );
}
