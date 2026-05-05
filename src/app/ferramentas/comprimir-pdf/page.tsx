import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { ComprimirPdfClient } from "./ComprimirPdfClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
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

      <EcosystemSection />

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como comprimir arquivos PDF sem perder qualidade
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione o arquivo PDF que você deseja reduzir o tamanho.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Qualidade</h3>
              <p className="text-sm text-slate-600 font-mono">Escolha o nível de compressão (Baixa, Média ou Alta).</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Baixar</h3>
              <p className="text-sm text-slate-600 font-mono">Aguarde o processamento e baixe seu arquivo otimizado.</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <a 
              href="/tutoriais/como-comprimir-pdf"
              className="inline-flex items-center gap-2 bg-slate-950 text-[#ccff00] border-4 border-slate-950 px-6 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#ccff00] hover:translate-y-[-2px] transition-transform"
            >
              Veja o tutorial completo
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </a>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">A compressão afeta a leitura do PDF?</h3>
                <p className="text-sm text-slate-600 font-mono">Nossa ferramenta utiliza algoritmos inteligentes para reduzir o tamanho removendo dados redundantes. Na qualidade &quot;Média&quot; ou &quot;Alta&quot;, a diferença visual é imperceptível.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">É seguro enviar meus documentos?</h3>
                <p className="text-sm text-slate-600 font-mono">Absolutamente. O processamento ocorre em memória e os arquivos são deletados logo após o uso. Sua privacidade é nossa prioridade número um.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 pb-12">
        <PrivacyBanner />
      </div>
    </>
  );
}
