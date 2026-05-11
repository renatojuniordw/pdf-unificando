"use client";

import { useEffect } from "react";
import { logError } from "@/lib/utils/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('Global Error', error, { digest: error.digest })
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="bg-slate-100">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-xl w-full bg-white border-4 border-slate-950 shadow-[8px_8px_0px_#000] p-8 md:p-10 flex flex-col gap-6">
            <h1 className="font-black uppercase tracking-tighter text-3xl text-slate-950">
              Erro crítico
            </h1>
            <p className="text-sm font-mono text-slate-700 leading-relaxed">
              O aplicativo encontrou um problema inesperado. Nossa equipe foi notificada.
            </p>
            <button
              onClick={reset}
              className="bg-slate-950 text-[#ccff00] border-4 border-slate-950 shadow-[4px_4px_0px_#ccff00] px-5 py-3 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors w-fit"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
