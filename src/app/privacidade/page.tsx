import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { siteUrl } from '@/lib/site'

const PRIVACY_EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacidade@unificando.com.br'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Entenda como o Unificando PDF processa arquivos, cookies e analytics, e quais dados são armazenados durante o uso das ferramentas.',
  alternates: {
    canonical: '/privacidade',
  },
  openGraph: {
    title: 'Política de Privacidade | Unificando PDF',
    description: 'Saiba como tratamos arquivos, cookies e analytics no Unificando PDF.',
    url: siteUrl('/privacidade'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Política de Privacidade | Unificando PDF',
    description: 'Saiba como tratamos arquivos, cookies e analytics no Unificando PDF.',
  },
}

export default function PrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: 'Início', href: '/' },
          { label: 'Privacidade' },
        ]}
      />
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
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">COOKIES, RASTREAMENTO E CONSENTIMENTO</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Usamos cookies e tecnologias semelhantes apenas mediante o seu consentimento, exibido em banner
            na primeira visita. Você pode aceitar ou recusar a qualquer momento — a recusa não impede o uso
            das ferramentas. Scripts de terceiros só são carregados após a sua aceitação.
          </p>
          <ul className="mt-4 font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed list-disc list-inside space-y-2">
            <li><strong>Google Analytics 4 (GA4)</strong> — métricas de audiência e uso (IP, user-agent, páginas visitadas, eventos de ferramentas).</li>
            <li><strong>Google Tag Manager (GTM)</strong> — gerenciador de tags que coordena GA4 e outras tags.</li>
            <li><strong>Meta Pixel</strong> — medição de conversão e audiência de anúncios do Facebook/Instagram.</li>
            <li><strong>Google AdSense</strong> — exibição de publicidade contextual.</li>
          </ul>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">BASE LEGAL (LGPD — LEI 13.709/2018)</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            O tratamento de dados de navegação para fins de analytics e publicidade se fundamenta no seu
            <strong> consentimento</strong> (Art. 7º, I). A operação de processamento de arquivos é realizada
            exclusivamente em memória, sem armazenamento, no exercício regular de direitos (Art. 7º, VII) e
            legítimo interesse na prestação do serviço (Art. 10), sem exposição de dados pessoais sensíveis.
          </p>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">RETENÇÃO E ELIMINAÇÃO</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Seus arquivos não são retidos: são processados em memória e descartados imediatamente. Dados de
            navegação coletados por plataformas de terceiros seguem as políticas de retenção de cada
            fornecedor (Google e Meta), que você pode configurar/limpar nos painéis dessas plataformas.
          </p>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">TRANSFERÊNCIA INTERNACIONAL</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Os provedores de analytics e publicidade (Google LLC e Meta Platforms) podem processar dados em
            servidores fora do Brasil. Essas transferências se amparam em cláusulas contratuais padrão e
            decisões de adequação reconhecidas pela ANPD na forma da legislação aplicável (Art. 33 da LGPD).
          </p>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">SEUS DIREITOS (ART. 18)</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Você pode, a qualquer momento: confirmar a existência de tratamento; acessar e corrigir dados;
            solicitar anonimização, bloqueio ou eliminação; revogar o consentimento e solicitar portabilidade.
            Para exercer seus direitos, escreva para o e-mail abaixo — responderemos em até 15 dias, conforme
            o Art. 19.
          </p>
        </section>
        <section className="border-4 border-slate-950 p-6 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4">CONTATO E ENCARREGADO (DPO)</h2>
          <p className="font-mono text-sm uppercase tracking-widest text-slate-600 leading-relaxed">
            Encarregado de Dados (Art. 41): {PRIVACY_EMAIL}. Para qualquer questão de privacidade, LGPD ou
            exercício de direitos, utilize o mesmo canal.
          </p>
        </section>
      </div>
    </main>
  )
}
