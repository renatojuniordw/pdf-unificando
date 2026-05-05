import type { Metadata } from 'next'
import { tutorials } from '@/config/tutorials'
import { JsonLd, generateBreadcrumbSchema } from '@/components/seo/JsonLd'
import { TutorialsList } from '@/components/tutorials/TutorialsList'

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

      <TutorialsList tutorials={tutorials} />
    </>
  )
}
