import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t-8 border-[#ccff00] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12 border-b-2 border-slate-800 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#ccff00] p-2 border-2 border-slate-950 shadow-[4px_4px_0px_#fff]">
                <span className="font-black text-slate-950 text-xs uppercase tracking-tighter leading-none">UNIFICANDO</span>
              </div>
              <span className="font-black text-white text-xs uppercase tracking-widest">ECOSSISTEMA</span>
            </div>
            <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest leading-relaxed max-w-sm">
              Desenvolvido com foco total em performance e privacidade pela Unificando. 
              Nossas ferramentas são projetadas para serem rápidas, seguras e extremamente fáceis de usar.
            </p>
          </div>
          
          <div className="flex flex-col md:items-end justify-center">
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Pronto para o próximo nível?</p>
            <a 
              href="https://unificando.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#ccff00] border-2 border-[#ccff00] px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-[#ccff00] hover:text-slate-950 transition-all shadow-[6px_6px_0px_rgba(204,255,0,0.3)] hover:shadow-none"
            >
              Consultoria em IA e Desenvolvimento
            </a>
            <div className="flex gap-4 mt-6 text-slate-600 text-[8px] font-black uppercase tracking-widest">
              <span>IA</span>
              <span>•</span>
              <span>Web</span>
              <span>•</span>
              <span>Sistemas</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            © {new Date().getFullYear()} Unificando PDF Tools. Um produto do ecossistema Unificando.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacidade"
              className="text-slate-400 hover:text-[#ccff00] text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              Privacidade
            </Link>
            <a
              href="https://unificando.com.br/servicos/ia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ccff00] hover:underline text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              Atendimento com IA
            </a>
            <a
              href="https://unificando.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#ccff00] text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              Site Oficial
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
