import Link from "next/link";
import { Metadata } from "next";
import { getTool } from "@/config/tools";
import { JpgParaPdfClient } from "./JpgParaPdfClient";
import { PrivacyBanner } from "@/components/tools/PrivacyBanner";
import { JsonLd, generateWebApplicationSchema, generateBreadcrumbSchema } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const tool = getTool("jpg-para-pdf");

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

export default function JpgParaPdfPage() {
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

        <JpgParaPdfClient />
      </div>


      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Como converter imagens JPG para PDF online
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">01</span>
              <h3 className="font-bold uppercase mb-2">Adicionar</h3>
              <p className="text-sm text-slate-600 font-mono">Selecione uma ou mais imagens JPG, JPEG ou PNG do seu dispositivo.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">02</span>
              <h3 className="font-bold uppercase mb-2">Reordenar</h3>
              <p className="text-sm text-slate-600 font-mono">Arraste as imagens para definir a ordem em que aparecerão no PDF final.</p>
            </div>
            <div className="border-4 border-slate-950 p-6 shadow-[4px_4px_0px_#000]">
              <span className="text-4xl font-black text-slate-200 block mb-2">03</span>
              <h3 className="font-bold uppercase mb-2">Gerar</h3>
              <p className="text-sm text-slate-600 font-mono">Clique para converter e baixe seu arquivo PDF contendo todas as imagens.</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/tutoriais/como-converter-imagem-em-pdf"
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
                <h3 className="font-black uppercase text-lg mb-2">Posso colocar várias imagens em um único PDF?</h3>
                <p className="text-sm text-slate-600 font-mono">Sim! Você pode selecionar dezenas de imagens e nossa ferramenta irá criar um PDF onde cada imagem ocupa uma página, mantendo a qualidade original.</p>
              </div>
              <div className="border-4 border-slate-950 p-6">
                <h3 className="font-black uppercase text-lg mb-2">Quais formatos de imagem são aceitos?</h3>
                <p className="text-sm text-slate-600 font-mono">Suportamos os formatos mais comuns: JPG, JPEG e PNG. Todas as imagens enviadas serão otimizadas para o formato PDF.</p>
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
