import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { ExtrairPaginasClient } from "./ExtrairPaginasClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";

const tool = getTool("extrair-paginas");

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

export default function ExtrairPaginasPage() {
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

        <ExtrairPaginasClient />
      </div>


      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como extrair páginas do PDF online
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Selecione</h3>
              <p className="text-sm text-slate-600 font-mono">Informe as páginas desejadas no formato 1-3, 5, 7-9.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Envie o PDF original para processamento seguro e temporário.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Baixe</h3>
              <p className="text-sm text-slate-600 font-mono">Receba um arquivo .zip com um PDF individual para cada página extraída.</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Posso extrair páginas não sequenciais?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. Você pode combinar páginas únicas e intervalos, como 1, 3, 7-9.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">O resultado vem em vários PDFs?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. Cada página selecionada é salva como um PDF individual dentro de um único arquivo .zip.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">O arquivo original é alterado?</h3>
                <p className="text-sm text-slate-600 font-mono">Não. O PDF original permanece intacto e só usamos uma cópia temporária para gerar os arquivos extraídos.</p>
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
