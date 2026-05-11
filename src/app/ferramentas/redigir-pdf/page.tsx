import Link from "next/link";
import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { RedigirPdfClient } from "./RedigirPdfClient";
import { LocalErrorBoundary } from "@/components/errors/LocalErrorBoundary";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";

const tool = getTool("redigir-pdf");

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

export default function RedigirPdfPage() {
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

        <LocalErrorBoundary
          title="EDITOR INDISPONÍVEL"
          message="O editor de redação encontrou um problema. Você pode tentar novamente sem sair da página."
        >
          <RedigirPdfClient />
        </LocalErrorBoundary>
      </div>

      <EcosystemSection />

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como censurar texto em PDF permanentemente
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione o PDF com o conteúdo que deseja ocultar.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Marcar</h3>
              <p className="text-sm text-slate-600 font-mono">Clique e arraste para desenhar retângulos sobre as áreas a censurar. Clique no × para remover uma marcação.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Baixar</h3>
              <p className="text-sm text-slate-600 font-mono">Aplique a censura e baixe o PDF com retângulos pretos permanentes sobre o conteúdo ocultado.</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/tutoriais/como-redigir-pdf-censurar-conteudo"
              className="inline-flex items-center gap-2 bg-slate-950 text-[#ccff00] border-4 border-slate-950 px-6 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#ccff00] hover:translate-y-[-2px] transition-transform"
            >
              Veja o tutorial completo
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </Link>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">O texto sob o retângulo pode ser recuperado?</h3>
                <p className="text-sm text-slate-600 font-mono">Não. A censura é permanente: um retângulo preto opaco é desenhado diretamente sobre o conteúdo da página, sem possibilidade de remoção ou recuperação do texto original.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Funciona em PDFs escaneados?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. Como aplicamos retângulos sobre a imagem da página, funciona tanto em PDFs com texto selecionável quanto em PDFs baseados em imagens (escaneados).</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Posso censurar múltiplas páginas?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. Todas as páginas do PDF são exibidas, e você pode desenhar marcações em qualquer página antes de aplicar a censura final.</p>
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
