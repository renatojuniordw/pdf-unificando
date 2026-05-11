import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-6 py-20">
      <div className="w-full border-4 border-slate-950 bg-white p-8 shadow-[8px_8px_0px_#000] md:p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          404
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-tighter text-slate-950 md:text-6xl">
          Página não encontrada
        </h1>
        <p className="mt-5 max-w-2xl font-mono text-sm uppercase leading-relaxed tracking-widest text-slate-600">
          O endereço solicitado não existe ou foi movido para outro caminho.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="bg-slate-950 text-[#ccff00] border-4 border-slate-950 px-5 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#ccff00] hover:translate-y-[-2px] transition-transform"
          >
            Voltar para a home
          </Link>
          <Link
            href="/tutoriais"
            className="bg-white text-slate-950 border-4 border-slate-950 px-5 py-3 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:bg-slate-100 transition-colors"
          >
            Ver tutoriais
          </Link>
        </div>
      </div>
    </div>
  )
}
