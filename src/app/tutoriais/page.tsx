import Link from 'next/link'
import type { Metadata } from 'next'
import { tutorials } from '@/config/tutorials'
import { getTool } from '@/config/tools'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Tutoriais',
  description:
    'Guias práticos para usar as ferramentas do Unificando PDF e resolver tarefas comuns com documentos online.',
  alternates: {
    canonical: '/tutoriais',
  },
  openGraph: {
    title: 'Tutoriais de PDF Online',
    description:
      'Aprenda como comprimir, juntar e converter arquivos usando as ferramentas do Unificando PDF.',
    type: 'website',
  },
}

export default function TutoriaisPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: 'https://pdf.unificando.com.br/' },
    { name: 'Tutoriais', url: 'https://pdf.unificando.com.br/tutoriais' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-slate-950 border-b-8 border-[#ccff00] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-[#ccff00] text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#fff] mb-6">
            GUIAS PRÁTICOS
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.95] text-[#ccff00] max-w-4xl">
            Tutoriais para usar nossas ferramentas de PDF
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-400 mt-6 max-w-2xl">
            Conteúdo direto ao ponto para quem quer entender o processo, evitar erros e usar a ferramenta certa.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Idealizado por</span>
            <a 
              href="https://unificando.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-950 px-4 py-2 border-2 border-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] transition-colors shadow-[4px_4px_0px_#ccff00]"
            >
              Unificando.com.br
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tutorials.map((tutorial) => {
              const tool = getTool(tutorial.targetToolSlug)

              return (
                <article
                  key={tutorial.slug}
                  className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6 flex flex-col"
                >
                  <span className="inline-block self-start bg-slate-950 text-[#ccff00] text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-slate-950 shadow-[2px_2px_0px_#ccff00]">
                    {tutorial.searchIntent}
                  </span>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-950 mt-4">
                    {tutorial.title}
                  </h2>
                  <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-3 leading-relaxed flex-1">
                    {tutorial.description}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mt-5">
                    Ferramenta indicada: {tool.name}
                  </p>
                  <div className="flex gap-3 mt-6">
                    <Link
                      href={`/tutoriais/${tutorial.slug}`}
                      className="flex-1 bg-[#ccff00] text-slate-950 border-4 border-slate-950 px-4 py-3 text-center font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] transition-transform"
                    >
                      Ler tutorial
                    </Link>
                    <Link
                      href={`/ferramentas/${tool.slug}`}
                      className="flex-1 bg-white text-slate-950 border-4 border-slate-950 px-4 py-3 text-center font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:bg-slate-100 transition-colors"
                    >
                      Abrir ferramenta
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
