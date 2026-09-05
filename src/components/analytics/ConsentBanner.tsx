'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { CONSENT_EVENT, readConsent, writeConsent, type ConsentStatus } from '@/lib/consent'

/**
 * Banner de consentimento de cookies (LGPD). Exibido até o usuário decidir;
 * o carregamento de scripts de terceiros fica bloqueado até "Aceitar".
 *
 * Usa useSyncExternalStore para ler a preferência do localStorage sem causar
 * hydration mismatch: o servidor renderiza o banner (getServerSnapshot = null)
 * e, após a hidratação, o estado real esconde/ajusta o banner quando preciso.
 */
function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange()
  window.addEventListener('storage', onChange)
  window.addEventListener(CONSENT_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CONSENT_EVENT, onChange)
  }
}

const getSnapshot = (): ConsentStatus => readConsent()
const getServerSnapshot = (): ConsentStatus => null

export function ConsentBanner() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (status !== null) return null

  const decide = (next: 'accepted' | 'rejected') => {
    writeConsent(next)
    window.dispatchEvent(new CustomEvent<ConsentStatus>(CONSENT_EVENT, { detail: next }))
  }

  return (
    <div
      role="region"
      aria-label="Consentimento de cookies"
      className="fixed bottom-0 inset-x-0 z-50 border-t-4 border-slate-950 bg-slate-950 text-slate-100 shadow-[0_-4px_0_#ccff00]"
    >
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm font-mono text-slate-300 leading-relaxed md:flex-1">
          Usamos cookies e tecnologias semelhantes (Google Analytics, Google Tag Manager,
          Meta Pixel e Google AdSense) para medir audiência e exibir anúncios. Seus arquivos
          nunca são armazenados. Você pode aceitar ou recusar — a recusa não impede o uso das ferramentas.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/privacidade"
            className="text-xs font-black uppercase tracking-widest text-[#ccff00] underline underline-offset-4 hover:text-white transition-colors"
          >
            Política de Privacidade
          </Link>
          <button
            type="button"
            onClick={() => decide('rejected')}
            className="text-xs font-black uppercase tracking-widest text-slate-300 border-2 border-slate-600 px-4 py-2 hover:border-slate-400 hover:text-white transition-colors"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => decide('accepted')}
            className="text-xs font-black uppercase tracking-widest text-slate-950 bg-[#ccff00] border-2 border-[#ccff00] px-4 py-2 hover:bg-[#b3ff00] transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}