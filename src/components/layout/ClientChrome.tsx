'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PWARegistration } from '@/components/pwa/PWARegistration'
import { OfflineBanner } from '@/components/network/OfflineBanner'
import { WebVitalsReporter } from '@/components/observability/WebVitalsReporter'

const CommandPalette = dynamic(
  () => import('@/components/layout/CommandPalette').then((mod) => mod.CommandPalette),
  { ssr: false },
)

const PWAInstallBanner = dynamic(
  () => import('@/components/pwa/PWAInstallBanner').then((mod) => mod.PWAInstallBanner),
  { ssr: false },
)

export function ClientChrome() {
  const pathname = usePathname()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const id = setTimeout(() => {
      const title = document.title || 'Página'
      setAnnouncement(`Navegou para ${title}`)
    }, 0)
    return () => clearTimeout(id)
  }, [pathname])

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <CommandPalette />
      <PWARegistration />
      <PWAInstallBanner />
      <OfflineBanner />
      <WebVitalsReporter />
    </>
  )
}
