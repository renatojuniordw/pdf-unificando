import { ToolGrid } from '@/components/tools/ToolGrid'
import { PrivacyBanner } from '@/components/tools/PrivacyBanner'
import { EcosystemSection } from '@/components/layout/EcosystemSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unificando PDF Tools — Ferramentas PDF gratuitas online',
  description: 'Comprima, junte, divida e converta PDFs online grátis. Sem cadastro. Zero armazenamento.',
}

export default function HomePage() {
  return (
    <>
      <section className="bg-slate-950 border-b-8 border-[#ccff00] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-[#ccff00] text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#fff] mb-6">
            100% GRATUITO. ZERO ARMAZENAMENTO.
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter uppercase leading-[0.9] text-[#ccff00]">
            FERRAMENTAS<br />PDF ONLINE
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-400 mt-6 max-w-xl">
            Comprima, junte, divida, converta e organize seus PDFs. Rápido, grátis e sem cadastro.
          </p>
        </div>
      </section>

      <section className="bg-white border-t-8 border-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-slate-950 text-[#ccff00] text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#ccff00] mb-6">
            FERRAMENTAS PDF
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-950 mb-12">
            ESCOLHA A FERRAMENTA
          </h2>
          <ToolGrid />
        </div>
      </section>

      <EcosystemSection />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <PrivacyBanner />
      </div>
    </>
  )
}
