import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Unificando PDF Tools',
  description: 'Seus arquivos não são armazenados. Processamento em memória.',
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
      <span className="inline-block bg-slate-950 text-[#ccff00] font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#ccff00] mb-6">
        PRIVACIDADE
      </span>
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-950 mb-12">
        POLÍTICA DE PRIVACIDADE
      </h1>
      <div className="prose max-w-none space-y-8">
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">SEUS ARQUIVOS</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Todos os arquivos enviados são processados exclusivamente em memória RAM e descartados imediatamente após o processamento. Não armazenamos nenhum arquivo em disco ou banco de dados.
          </p>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">COOKIES E ANALYTICS</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Utilizamos Google Analytics 4 para métricas de uso anônimas e Google AdSense para exibição de publicidade. Nenhum dado pessoal é coletado além do que é padrão dessas plataformas.
          </p>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">CONTATO</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Para questões de privacidade, entre em contato através do nosso site.
          </p>
        </section>
      </div>
    </div>
  )
}
