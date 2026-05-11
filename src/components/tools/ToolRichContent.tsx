import React from 'react'
import Link from 'next/link'

interface RichContentProps {
  toolName: string
  toolSlug: string
  description: string
  benefits: { title: string; text: string }[]
  useCases: { title: string; text: string }[]
  faq: { question: string; answer: string }[]
  tutorialSlug?: string
}

export function ToolRichContent({
  toolName,
  toolSlug: _toolSlug,
  description: _description,
  benefits,
  useCases,
  faq,
  tutorialSlug
}: RichContentProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24 border-t-4 border-slate-100">
      <div className="prose prose-slate max-w-none">
        <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-12">
          Tudo sobre {toolName} Online
        </h2>
        
        <p className="text-lg text-slate-700 leading-relaxed mb-12 font-medium">
          O <span className="font-black text-slate-950">Unificando PDF</span> oferece a maneira mais robusta e segura para você realizar o processo de <span className="text-slate-950 underline decoration-[#ccff00] decoration-4 underline-offset-4">{toolName.toLowerCase()}</span> sem complicações. Nossa ferramenta foi desenvolvida para profissionais que precisam de agilidade e privacidade total.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#ccff00] border-2 border-slate-950 flex items-center justify-center text-xs">✓</span>
              Principais Vantagens
            </h3>
            <ul className="space-y-4 list-none p-0">
              {benefits.map((benefit, i) => (
                <li key={i} className="border-l-4 border-[#ccff00] pl-4 py-1">
                  <strong className="block uppercase text-xs font-black mb-1">{benefit.title}</strong>
                  <span className="text-sm text-slate-600 font-mono leading-relaxed">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-950 text-white border-2 border-slate-950 flex items-center justify-center text-xs">?</span>
              Quando usar?
            </h3>
            <ul className="space-y-4 list-none p-0">
              {useCases.map((useCase, i) => (
                <li key={i} className="border-l-4 border-slate-950 pl-4 py-1">
                  <strong className="block uppercase text-xs font-black mb-1">{useCase.title}</strong>
                  <span className="text-sm text-slate-600 font-mono leading-relaxed">{useCase.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {tutorialSlug && (
          <div className="bg-slate-50 border-4 border-slate-950 p-8 shadow-[8px_8px_0px_#ccff00] mb-20 text-center">
            <h3 className="text-xl font-black uppercase mb-4">Precisa de ajuda detalhada?</h3>
            <p className="text-sm text-slate-600 font-mono mb-6">Preparamos um guia passo a passo completo para você dominar esta ferramenta.</p>
            <Link 
              href={`/tutoriais/${tutorialSlug}`}
              className="inline-flex items-center gap-2 bg-slate-950 text-[#ccff00] border-4 border-slate-950 px-6 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#ccff00] hover:translate-y-[-2px] transition-transform"
            >
              Ver Tutorial Passo a Passo
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </Link>
          </div>
        )}

        <div className="mt-20">
          <h3 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-slate-950 pb-2 mb-8">
            Dúvidas Frequentes sobre {toolName}
          </h3>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="group border-4 border-slate-950 bg-white p-6 open:bg-[#ccff00] transition-colors cursor-pointer">
                <summary className="font-black uppercase list-none flex justify-between items-center">
                  <span>{item.question}</span>
                  <span className="group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-4 text-sm font-mono text-slate-700 leading-relaxed uppercase">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
