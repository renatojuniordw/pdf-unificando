import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { MarcaDaguaClient } from "./MarcaDaguaClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";

const tool = getTool("marca-dagua");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.seoDescription,
  alternates: {
    canonical: `/ferramentas/${tool.slug}`,
  },
  openGraph: {
    title: `${tool.name} em PDF Online e Grátis`,
    description: tool.seoDescription,
    type: "website",
  },
};

export default function MarcaDaguaPage() {
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

        <MarcaDaguaClient />
      </div>

      <EcosystemSection />

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como adicionar marca d&apos;água em PDF
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Texto</h3>
              <p className="text-sm text-slate-600 font-mono">Digite o texto da marca d&apos;água e escolha cor e opacidade.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione ou arraste o arquivo PDF que deseja marcar.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Baixar</h3>
              <p className="text-sm text-slate-600 font-mono">Aguarde o processamento e baixe o PDF com a marca d&apos;água aplicada.</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">A marca d&apos;água pode ser removida?</h3>
                <p className="text-sm text-slate-600 font-mono">A marca d&apos;água é aplicada diretamente no conteúdo do PDF, tornando a remoção difícil. Para documentos confidenciais, use uma opacidade maior.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">A marca aparece em todas as páginas?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. O texto é aplicado em todas as páginas do documento, centralizado na diagonal.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Posso usar qualquer texto?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim, até 100 caracteres. Textos curtos como &quot;CONFIDENCIAL&quot;, &quot;RASCUNHO&quot; ou &quot;CÓPIA&quot; funcionam melhor visualmente.</p>
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
