import Link from "next/link";
import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { PdfParaPngClient } from "./PdfParaPngClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";

const tool = getTool("pdf-para-png");

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

export default function PdfParaPngPage() {
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

        <PdfParaPngClient />
      </div>


      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como converter PDF para PNG com fundo transparente
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Resolução</h3>
              <p className="text-sm text-slate-600 font-mono">Escolha o DPI conforme o uso: 72 para telas, 300 para impressão de alta qualidade.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione o arquivo PDF que deseja converter em imagens PNG.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Baixar</h3>
              <p className="text-sm text-slate-600 font-mono">Baixe o PNG (página única) ou um ZIP com todas as páginas.</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/tutoriais/como-converter-pdf-em-png"
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
                <h3 className="font-black uppercase text-lg mb-2">Qual a diferença entre PNG e JPG?</h3>
                <p className="text-sm text-slate-600 font-mono">PNG suporta fundo transparente e usa compressão sem perda de qualidade. JPG é melhor para fotos, PNG é ideal para design, logos e elementos gráficos.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">O fundo realmente fica transparente?</h3>
                <p className="text-sm text-slate-600 font-mono">O fundo da página fica transparente quando o PDF não tem um fundo branco explícito. PDFs com fundo desenhado manterão essa cor.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Posso usar em Figma, Photoshop ou Canva?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. PNGs com fundo transparente são amplamente compatíveis com ferramentas de design como Figma, Adobe Photoshop, Illustrator e Canva.</p>
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
