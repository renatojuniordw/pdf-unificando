import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PdfParaTxtClient } from "./PdfParaTxtClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site";

const tool = getTool("pdf-para-txt");

export const metadata: Metadata = {
  title: tool.name,
  description: tool.seoDescription,
  alternates: {
    canonical: `/ferramentas/${tool.slug}`,
  },
  openGraph: {
    title: `${tool.name} Online e Grátis`,
    description: tool.seoDescription,
    url: siteUrl(`/ferramentas/${tool.slug}`),
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${tool.name} Online e Grátis`,
    description: tool.seoDescription,
  },
};

export default function PdfParaTxtPage() {
  const jsonLd = generateWebApplicationSchema(tool);

  return (
    <>
      <JsonLd data={jsonLd} />

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

        <PdfParaTxtClient />
      </div>


      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como converter PDF para TXT online
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione o PDF que contém texto digital.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Extração</h3>
              <p className="text-sm text-slate-600 font-mono">O conteúdo textual é separado do PDF e organizado em um arquivo .txt limpo.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Download</h3>
              <p className="text-sm text-slate-600 font-mono">Baixe o TXT pronto para leitura simples, cópia ou uso em outras ferramentas.</p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Funciona com PDF escaneado?</h3>
                <p className="text-sm text-slate-600 font-mono">Não. PDFs compostos apenas por imagem exigem OCR, que não está disponível nesta ferramenta.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">A formatação visual do PDF é mantida?</h3>
                <p className="text-sm text-slate-600 font-mono">Não. O foco aqui é extrair somente o texto, sem layout, estilos ou imagens.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Posso copiar o texto antes de baixar?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. A pré-visualização permite revisar e copiar o conteúdo diretamente na página.</p>
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
