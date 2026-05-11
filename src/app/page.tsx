import { ToolGrid } from '@/components/tools/ToolGrid'
import { PrivacyBanner } from '@/components/tools/PrivacyBanner'
import { EcosystemSection } from '@/components/layout/EcosystemSection'
import type { Metadata } from 'next'
import { JsonLd, generateOrganizationSchema, generateWebSiteSchema, generateFAQSchema } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Juntar, Comprimir e Converter PDF Online — 100% Grátis',
  description: 'A melhor ferramenta para Juntar, Comprimir e Converter PDF Online. Totalmente grátis, sem cadastro e com segurança máxima. Unifique arquivos PDF em segundos.',
}

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebSiteSchema()
  const faqSchema = generateFAQSchema([
    {
      question: 'COMO JUNTAR, COMPRIMIR E CONVERTER PDF ONLINE GRÁTIS?',
      answer: 'O Unificando PDF oferece ferramentas web integradas. Basta selecionar a ferramenta desejada (como Juntar ou Comprimir), arrastar seus arquivos e processar instantaneamente no navegador.'
    },
    {
      question: 'O UNIFICANDO PDF É SEGURO?',
      answer: 'Sim. Utilizamos conexões criptografadas (HTTPS) e nossos servidores deletam automaticamente qualquer dado temporário após o processamento. Seus arquivos nunca são armazenados permanentemente.'
    },
    {
      question: 'QUAIS SÃO AS FERRAMENTAS DISPONÍVEIS?',
      answer: 'Oferecemos ferramentas para Juntar PDF, Comprimir PDF, Converter para Word, JPG, Markdown e muito mais. Tudo sem necessidade de instalar softwares ou criar contas.'
    }
  ])

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={faqSchema} />
      <section className="bg-slate-950 border-b-8 border-[#ccff00] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-[#ccff00] text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#fff] mb-6">
            100% GRATUITO. SEM CADASTRO. SEGURO.
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter uppercase leading-[0.9] text-[#ccff00]">
            JUNTAR, COMPRIMIR<br />E CONVERTER PDF
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-400 mt-6 max-w-2xl">
            A solução definitiva para gerenciar seus documentos. Junte múltiplos arquivos, reduza o tamanho de PDFs pesados e converta formatos com a velocidade da elite. 
            Sem limites, sem marcas d&apos;água e totalmente online.
          </p>
        </div>
      </section>

      <section className="bg-white border-t-8 border-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-slate-950 text-[#ccff00] text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#ccff00] mb-6">
            FERRAMENTAS PDF PROFISSIONAIS
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-950 mb-12">
            ESCOLHA O QUE PRECISA
          </h2>
          <ToolGrid />
        </div>
      </section>

      <EcosystemSection />

      <section className="bg-slate-50 border-t-8 border-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 mb-8">
                POR QUE USAR O<br />UNIFICANDO PDF?
              </h2>
              <div className="space-y-6">
                <div className="border-4 border-slate-950 bg-white p-6 shadow-[8px_8px_0px_#000]">
                  <h3 className="font-black uppercase text-xl mb-2">Privacidade em Primeiro Lugar</h3>
                  <p className="text-sm text-slate-600 font-mono">Não armazenamos seus arquivos. O processamento é efêmero e os dados são excluídos permanentemente após a operação.</p>
                </div>
                <div className="border-4 border-slate-950 bg-white p-6 shadow-[8px_8px_0px_#000]">
                  <h3 className="font-black uppercase text-xl mb-2">Totalmente Gratuito</h3>
                  <p className="text-sm text-slate-600 font-mono">Sem taxas escondidas, sem limites de arquivos e sem necessidade de criar conta ou deixar seu e-mail.</p>
                </div>
                <div className="border-4 border-slate-950 bg-white p-6 shadow-[8px_8px_0px_#000]">
                  <h3 className="font-black uppercase text-xl mb-2">Interface Neo-Brutalista</h3>
                  <p className="text-sm text-slate-600 font-mono">Focamos na funcionalidade e clareza. Ferramentas rápidas que resolvem seu problema em segundos, sem distrações.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 mb-8">
                PERGUNTAS FREQUENTES
              </h2>
              <div className="space-y-4">
                <details className="group border-4 border-slate-950 bg-white p-6 open:bg-[#ccff00] transition-colors cursor-pointer">
                  <summary className="font-black uppercase list-none flex justify-between items-center">
                    <span>COMO O UNIFICANDO PDF É GRATUITO?</span>
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-sm font-mono text-slate-700">
                    O Unificando PDF é uma iniciativa da <span className="font-black">Unificando</span>, uma empresa especializada em software de elite e IA. 
                    Oferecemos esta ferramenta gratuitamente para demonstrar nossa excelência técnica e como forma de contribuir com soluções de alta performance para a comunidade digital.
                  </p>
                </details>
                <details className="group border-4 border-slate-950 bg-white p-6 open:bg-[#ccff00] transition-colors cursor-pointer">
                  <summary className="font-black uppercase list-none flex justify-between items-center">
                    <span>MEUS ARQUIVOS ESTÃO SEGUROS?</span>
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-sm font-mono text-slate-700">Sim. Utilizamos conexões criptografadas (HTTPS) e nossos servidores deletam automaticamente qualquer dado temporário após o processamento.</p>
                </details>
                <details className="group border-4 border-slate-950 bg-white p-6 open:bg-[#ccff00] transition-colors cursor-pointer">
                  <summary className="font-black uppercase list-none flex justify-between items-center">
                    <span>EXISTE LIMITE DE TAMANHO DE ARQUIVO?</span>
                    <span className="group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-4 text-sm font-mono text-slate-700">Aceitamos arquivos de até 50MB para garantir a melhor performance e velocidade de processamento para todos os usuários.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <PrivacyBanner />
      </div>
    </>
  )
}
