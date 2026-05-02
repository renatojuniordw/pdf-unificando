'use client'

import { useEffect, useRef } from 'react'

interface AdSlotProps {
  slot: string
  format: 'leaderboard' | 'sidebar' | 'footer'
  className?: string
}

const DIMENSIONS: Record<AdSlotProps['format'], { width: number; height: number }> = {
  leaderboard: { width: 728, height: 90 },
  sidebar: { width: 300, height: 250 },
  footer: { width: 728, height: 90 },
}

export function AdSlot({ slot, format, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !adRef.current) return
    initialized.current = true
    try {
      const win = window as typeof window & { adsbygoogle?: object[] }
      win.adsbygoogle = win.adsbygoogle ?? []
      win.adsbygoogle.push({})
    } catch {
      // AdSense not loaded
    }
  }, [])

  const { width, height } = DIMENSIONS[format]

  return (
    <div className={`border-4 border-slate-200 flex flex-col items-center ${className}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 self-start px-1 pt-1">
        PUBLICIDADE
      </p>
      <div ref={adRef} style={{ minWidth: width, minHeight: height }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width, height }}
          data-ad-client="ca-pub-XXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
