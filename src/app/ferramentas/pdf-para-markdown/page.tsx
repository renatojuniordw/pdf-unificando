import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { PdfParaMarkdownClient } from "./PdfParaMarkdownClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { EcosystemSection } from "@/components/layout/EcosystemSection";
import { JsonLd, generateWebApplicationSchema } from "@/components/seo/JsonLd";

const tool = getTool("pdf-para-markdown");

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

export default function PdfParaMarkdownPage() {
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

        <PdfParaMarkdownClient />
      </div>

      <EcosystemSection />

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como converter PDF para Markdown online
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Upload</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione o arquivo PDF que deseja converter em texto estruturado.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Conversão</h3>
              <p className="text-sm text-slate-600 font-mono">O texto é extraído e formatado automaticamente com títulos, listas e parágrafos.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Download</h3>
              <p className="text-sm text-slate-600 font-mono">Baixe o arquivo .md pronto para usar em RAG, LLMs, wikis ou editores Markdown.</p>
            </div>
          </div>

          <div className="mt-16 border-4 border-slate-950 p-8 shadow-[8px_8px_0px_#ccff00]">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">
              Por que usar Markdown para IA e RAG?
            </h2>
            <div className="space-y-3 text-sm font-mono text-slate-700">
              <p>
                Modelos de linguagem (LLMs) como GPT, Claude e Llama processam texto puro muito melhor do que PDFs binários. O formato Markdown preserva a estrutura do documento — títulos, listas, parágrafos — sem o ruído de tags HTML ou a opacidade dos PDFs.
              </p>
              <p>
                Em pipelines de <strong>RAG (Retrieval-Augmented Generation)</strong>, documentos em Markdown são divididos em chunks com fronteiras semânticas claras (seções delimitadas por <code>#</code>), o que melhora diretamente a precisão da recuperação e a qualidade das respostas geradas.
              </p>
              <p>
                Ferramentas como LangChain, LlamaIndex e Haystack têm parsers nativos para Markdown, tornando a integração simples e eficiente.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Funciona com PDFs escaneados?</h3>
                <p className="text-sm text-slate-600 font-mono">Não. Esta ferramenta extrai texto digital embutido no PDF. PDFs compostos apenas por imagens (escaneados) exigem OCR, que não está disponível nesta versão.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">A estrutura de títulos é preservada?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. Textos com tamanho de fonte maior que o corpo do documento são automaticamente convertidos em títulos Markdown (<code>#</code>, <code>##</code>, <code>###</code>) com base na proporção do tamanho.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Posso usar o resultado diretamente com LangChain?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim. O arquivo .md gerado é compatível com o <code>UnstructuredMarkdownLoader</code> e o <code>MarkdownTextSplitter</code> do LangChain, além de parsers similares no LlamaIndex e Haystack.</p>
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
