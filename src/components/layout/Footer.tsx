import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t-8 border-[#ccff00] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12 border-b-2 border-slate-800 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#ccff00] p-2 border-2 border-slate-950 shadow-[4px_4px_0px_#fff]">
                <span className="font-black text-slate-950 text-xs uppercase tracking-tighter leading-none">
                  UNIFICANDO
                </span>
              </div>
              <span className="font-black text-white text-xs uppercase tracking-widest">
                ECOSSISTEMA
              </span>
            </div>
            <p className="text-slate-300 font-mono text-[10px] uppercase tracking-widest leading-relaxed max-w-sm">
              Desenvolvido com foco total em performance e privacidade pela
              Unificando — laboratório de projetos autorais e inteligência
              artificial. Nossas ferramentas são projetadas para serem rápidas,
              seguras e extremamente fáceis de usar.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            © {new Date().getFullYear()} Unificando PDF — As melhores
            ferramentas para PDF Unificando arquivos e documentos online.
          </p>
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-6 list-none">
              <li>
                <Link
                  href="/tutoriais"
                  className="text-slate-400 hover:text-[#ccff00] text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  Tutoriais
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-slate-400 hover:text-[#ccff00] text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <a
                  href="https://unificando.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#ccff00] text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  Site Oficial
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
