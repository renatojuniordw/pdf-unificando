'use client'

import { useEffect } from 'react'

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
            console.log('PWA: Service Worker registrado com sucesso:', registration.scope)
          })
          .catch((error) => {
            console.error('PWA: Falha ao registrar Service Worker:', error)
          })
      })
    }
  }, [])

  return null
}
