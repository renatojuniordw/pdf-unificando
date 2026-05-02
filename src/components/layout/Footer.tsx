import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t-8 border-[#ccff00] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
          © {new Date().getFullYear()} Unificando PDF Tools. Todos os direitos reservados.
        </p>
        <Link
          href="/privacidade"
          className="text-[#ccff00] text-[9px] font-black uppercase tracking-widest hover:underline"
        >
          Política de Privacidade
        </Link>
      </div>
    </footer>
  )
}
