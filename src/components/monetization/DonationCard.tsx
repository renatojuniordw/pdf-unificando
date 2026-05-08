'use client'

import { useState } from 'react'
import { hasDonationEnabled, monetizationConfig } from '@/config/monetization'

interface DonationCardProps {
  compact?: boolean
  className?: string
}

export function DonationCard({
  compact = false,
  className,
}: DonationCardProps) {
  const [copied, setCopied] = useState(false)

  if (!hasDonationEnabled) {
    return null
  }

  const handleCopyPix = async () => {
    if (!monetizationConfig.donationPixKey) {
      return
    }

    try {
      await navigator.clipboard.writeText(monetizationConfig.donationPixKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      className={[
        'border-4 border-slate-950 bg-white shadow-[4px_4px_0px_#ccff00]',
        compact ? 'p-5' : 'p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="inline-block bg-[#ccff00] px-2 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-slate-950 border-2 border-slate-950">
        Apoie o projeto
      </span>

      <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-slate-950">
        Mantenha a ferramenta no ar sem cadastro e sem coleta de dados.
      </h3>

      <p className="mt-3 text-xs font-mono uppercase tracking-wide text-slate-600">
        {monetizationConfig.donationMessage}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {monetizationConfig.donationUrl ? (
          <a
            href={monetizationConfig.donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#ccff00] border-2 border-slate-950 hover:bg-slate-800 transition-colors"
          >
            Fazer doacao
          </a>
        ) : null}

        {monetizationConfig.donationPixKey ? (
          <button
            type="button"
            onClick={handleCopyPix}
            className="border-2 border-slate-950 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-950 hover:bg-slate-100 transition-colors"
          >
            {copied ? 'Pix copiado' : 'Copiar chave Pix'}
          </button>
        ) : null}
      </div>

      {monetizationConfig.donationPixKey ? (
        <p className="mt-4 break-all border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-slate-500">
          Pix: {monetizationConfig.donationPixKey}
        </p>
      ) : null}
    </section>
  )
}
