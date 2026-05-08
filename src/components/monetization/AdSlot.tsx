'use client'

import { useEffect, useId } from 'react'
import { monetizationConfig } from '@/config/monetization'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface AdSlotProps {
  slot?: string
  className?: string
  minHeightClassName?: string
}

export function AdSlot({
  slot,
  className,
  minHeightClassName = 'min-h-[140px]',
}: AdSlotProps) {
  const adId = useId()

  useEffect(() => {
    if (!slot || !monetizationConfig.adsenseClientId) {
      return
    }

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {
      // Ignore duplicate initialization attempts from client transitions.
    }
  }, [slot])

  if (!slot || !monetizationConfig.adsenseClientId) {
    return null
  }

  return (
    <aside
      aria-labelledby={adId}
      className={[
        'border-4 border-slate-950 bg-slate-100 p-4 shadow-[4px_4px_0px_#000]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p
          id={adId}
          className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500"
        >
          Publicidade
        </p>
        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
          Ajuda a manter o projeto gratuito
        </span>
      </div>

      <ins
        className={[
          'adsbygoogle block w-full overflow-hidden bg-white',
          minHeightClassName,
        ].join(' ')}
        style={{ display: 'block' }}
        data-ad-client={monetizationConfig.adsenseClientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest={process.env.NODE_ENV === 'production' ? undefined : 'on'}
      />
    </aside>
  )
}
