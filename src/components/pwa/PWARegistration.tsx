'use client'

import { useEffect } from 'react'
import { logError, logInfo } from '@/lib/utils/logger'

/**
 * Componente responsável por registrar o Service Worker do PWA.
 * Deve ser incluído no Layout principal.
 */
export function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.location.hostname !== 'localhost'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            logInfo('PWA', 'Service Worker registrado com sucesso', {
              scope: registration.scope,
            })
          })
          .catch((error) => {
            logError('PWA', error, { action: 'register_service_worker' })
          })
      })
    }
  }, [])

  return null
}
