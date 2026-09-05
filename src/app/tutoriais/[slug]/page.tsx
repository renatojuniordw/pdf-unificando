import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTutorial, tutorials } from '@/config/tutorials'
import { getTool } from '@/config/tools'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { siteUrl } from '@/lib/site'
import {
  JsonLd,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/components/seo/JsonLd'

type TutorialPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return tutorials.map((tutorial) => ({ slug: tutorial.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
  const { slug } = await params
  const tutorial = tutorials.find((item) => item.slug === slug)

  if (!tutorial) {
    return {
      title: 'Tutorial',
    }
  }

  // O layout já aplica o template "%s | Unificando PDF" — NÃO repetir a marca aqui.
  return {
    title: tutorial.title,
    description: tutorial.description,
    alternates: {
      canonical: `/tutoriais/${tutorial.slug}`,
    },
    openGraph: {
      title: tutorial.title,
      description: tutorial.description,
      url: siteUrl(`/tutoriais/${tutorial.slug}`),
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: tutorial.title,
      description: tutorial.description,
    },
  }
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const { slug } = await params
  const tutorial = tutorials.find((item) => item.slug === slug)

  if (!tutorial) {
    notFound()
  }

  const fullTutorial = getTutorial(tutorial.slug)
  const tool = getTool(fullTutorial.targetToolSlug)
  
  // Encontrar tutoriais relacionados (exceto o atual) de forma estável
  const tutorialIndex = tutorials.findIndex((t) => t.slug === fullTutorial.slug)
  const otherTutorials = tutorials.filter((t) => t.slug !== fullTutorial.slug)
  
  // Pega 3 tutoriais começando de um ponto baseado no índice do atual
  const relatedTutorials = []
  for (let i = 0; i < 3 && otherTutorials.length > 0; i++) {
    const nextIdx = (tutorialIndex + 1 + i) % otherTutorials.length
    relatedTutorials.push(otherTutorials[nextIdx])
  }

  const articleSchema = generateArticleSchema({
    title: fullTutorial.title,
    description: fullTutorial.description,
    slug: fullTutorial.slug,
    publishedAt: fullTutorial.publishedAt,
    updatedAt: fullTutorial.updatedAt,
  })

  const published = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(
    new Date(`${fullTutorial.updatedAt ?? fullTutorial.publishedAt}T00:00:00Z`),
  )
  
  const howToSchema = generateHowToSchema({
    title: fullTutorial.title,
    description: fullTutorial.description,
    slug: fullTutorial.slug,
    steps: fullTutorial.steps,
    estimatedTime: fullTutorial.estimatedTime,
  })

  const faqSchema = generateFAQSchema(fullTutorial.faqs)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Início', url: siteUrl('/') },
    { name: 'Tutoriais', url: siteUrl('/tutoriais') },
    {
      name: fullTutorial.title,
      url: siteUrl(`/tutoriais/${fullTutorial.slug}`),
    },
  ])

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main>
      <section className="bg-[#ccff00] border-b-4 border-slate-950 py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: 'Início', href: '/' },
              { label: 'Tutoriais', href: '/tutoriais' },
              { label: fullTutorial.title },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-block bg-slate-950 text-[#ccff00] font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000]">
              TUTORIAL
            </span>
            <span className="inline-block bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000]">
              ⏱️ {fullTutorial.estimatedTime}
            </span>
            <span className="inline-block bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000]">
              📊 {fullTutorial.difficulty}
            </span>
            <span data-testid="tutorial-date" className="inline-block bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000]">
              🗓️ Atualizado em {published}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.95] text-slate-950">
            {fullTutorial.title}
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-700 mt-5 max-w-3xl">
            {fullTutorial.description}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href={`/ferramentas/${tool.slug}`}
              className="bg-slate-950 text-[#ccff00] border-4 border-slate-950 px-5 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#fff] hover:translate-y-[-2px] transition-transform"
            >
              Usar {tool.name}
            </Link>
            <Link
              href="/tutoriais"
              className="bg-white text-slate-950 border-4 border-slate-950 px-5 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:bg-slate-100 transition-colors"
            >
              Ver mais tutoriais
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid gap-12">
          <article className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-8">
            <p className="text-base text-slate-700 leading-8">{fullTutorial.intro}</p>

            <div className="mt-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-950 mb-6">
                Quando este tutorial ajuda
              </h2>
              <ul className="space-y-3">
                {fullTutorial.whenToUse.map((item) => (
                  <li
                    key={item}
                    className="border-2 border-slate-950 bg-slate-50 px-4 py-3 text-sm font-mono uppercase tracking-wider text-slate-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <section>
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Passo a passo
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {fullTutorial.steps.map((step, index) => (
                <div
                  key={step.title}
                  id={`step-${index + 1}`}
                  className="border-4 border-slate-950 bg-white p-6 shadow-[6px_6px_0px_#000]"
                >
                  <span className="text-4xl font-black text-slate-200 block mb-2">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-black uppercase text-xl tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="text-sm font-mono uppercase tracking-wide text-slate-600 mt-3 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Erros comuns
            </h2>
            <div className="grid gap-4">
              {fullTutorial.commonMistakes.map((item) => (
                <div
                  key={item}
                  className="border-4 border-slate-950 bg-[#fff7d6] p-5 shadow-[4px_4px_0px_#000]"
                >
                  <p className="text-sm font-mono uppercase tracking-wide text-slate-800 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-4 border-slate-950 bg-slate-950 text-white p-8 shadow-[8px_8px_0px_#ccff00]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Ferramenta indicada
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#ccff00] mt-3">
              {tool.name}
            </h2>
            <p className="text-sm font-mono uppercase tracking-wide text-slate-300 mt-4 max-w-2xl">
              {tool.seoDescription}
            </p>
            <Link
              href={`/ferramentas/${tool.slug}`}
              className="inline-flex mt-6 bg-[#ccff00] text-slate-950 border-4 border-[#ccff00] px-5 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#fff] hover:translate-y-[-2px] transition-transform"
            >
              Abrir ferramenta agora
            </Link>
          </section>

          <section>
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Perguntas frequentes
            </h2>
            <div className="space-y-4">
              {fullTutorial.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-4 border-slate-950 bg-white p-6 open:bg-[#ccff00] transition-colors"
                >
                  <summary className="font-black uppercase list-none flex justify-between items-center cursor-pointer gap-4">
                    <span>{faq.question}</span>
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-sm font-mono uppercase tracking-wide text-slate-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Seção de Tutoriais Relacionados */}
          <section className="mt-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
              Veja também
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedTutorials.map((t) => (
                <Link 
                  key={t.slug}
                  href={`/tutoriais/${t.slug}`}
                  className="group border-4 border-slate-950 bg-white p-6 shadow-[4px_4px_0px_#000] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#000] transition-all"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-950 transition-colors">
                    TUTORIAL
                  </span>
                  <h3 className="font-black uppercase text-lg tracking-tight text-slate-950 mt-2 line-clamp-2">
                    {t.title}
                  </h3>
                  <div className="flex gap-2 mt-4">
                    <span className="text-[9px] font-bold uppercase bg-slate-100 px-2 py-1 border border-slate-200">
                      ⏱️ {t.estimatedTime}
                    </span>
                    <span className="text-[9px] font-bold uppercase bg-slate-100 px-2 py-1 border border-slate-200">
                      📊 {t.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-12 border-8 border-[#ccff00] bg-slate-950 p-10 shadow-[12px_12px_0px_#000] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00] opacity-10 rotate-45 translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <span className="inline-block bg-[#ccff00] text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1 mb-6">
                Quem desenvolveu?
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight mb-6">
                Este projeto é uma iniciativa da <span className="text-[#ccff00]">Unificando</span>.
              </h2>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-wider leading-relaxed max-w-3xl mb-8">
                Laboratório de projetos autorais e inteligência artificial que transforma processos complexos em ferramentas digitais de alta performance.
              </p>
              <a
                href="https://unificando.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[#ccff00] font-black uppercase text-xs tracking-widest underline decoration-2 underline-offset-4 hover:text-white transition-colors"
              >
                unificando.com.br
              </a>
            </div>
          </section>
        </div>
      </section>
      </main>
    </>
  )
}
