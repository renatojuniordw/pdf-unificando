'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEventListener } from '@/hooks/useEventListener'
import { logError } from '@/lib/utils/logger'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installError, setInstallError] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const windowTarget = typeof window === 'undefined' ? null : window
  const showTimerRef = React.useRef<number | null>(null)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - navigator.standalone é específico para Safari iOS
      window.navigator.standalone === true)
  const isIOS =
    typeof window !== 'undefined' &&
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())

  const readDismissed = React.useCallback(() => {
    try {
      return sessionStorage.getItem('pwa-banner-dismissed') === 'true'
    } catch {
      return false
    }
  }, [])

  const scheduleVisibility = React.useCallback(() => {
    if (readDismissed()) return
    if (showTimerRef.current) window.clearTimeout(showTimerRef.current)
    showTimerRef.current = window.setTimeout(() => setIsVisible(true), 5000)
  }, [readDismissed])

  React.useEffect(() => {
    if (isIOS) {
      scheduleVisibility()
    }
  }, [isIOS, scheduleVisibility])

  React.useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        window.clearTimeout(showTimerRef.current)
      }
    }
  }, [])

  const handleBeforeInstallPrompt = React.useCallback((event: Event) => {
    const e = event as BeforeInstallPromptEvent
    e.preventDefault()
    setDeferredPrompt(e)

    scheduleVisibility()
  }, [scheduleVisibility])

  useEventListener(windowTarget, 'beforeinstallprompt', handleBeforeInstallPrompt)

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setInstallError(null)
    setIsInstalling(true)

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`PWA: Usuário escolheu ${outcome}`)
      setDeferredPrompt(null)
      setIsVisible(false)
    } catch (error) {
      const message = 'Não foi possível abrir o instalador agora. Tente novamente.'
      setInstallError(message)
      logError('PWA Install', error, { outcome: 'failed' })
    } finally {
      setIsInstalling(false)
    }
  }

  const dismiss = () => {
    setIsVisible(false)
    try {
      sessionStorage.setItem('pwa-banner-dismissed', 'true')
    } catch {
      // Ignora falhas de storage em navegação restrita
    }
  }

  if (isStandalone) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={shouldReduceMotion ? false : { y: 100, opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40"
        >
          <div data-testid="pwa-install-banner" className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 relative">
            <button
              type="button"
              data-testid="pwa-install-dismiss"
              onClick={dismiss}
              className="absolute -top-4 -right-4 bg-[#b91c1c] text-white border-4 border-black w-10 h-10 flex items-center justify-center font-black hover:scale-110 transition-transform cursor-pointer"
              aria-label="Fechar aviso de instalação"
            >
              X
            </button>

            <div className="flex gap-4">
              <div className="bg-neon-yellow border-2 border-black p-3 shrink-0 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>

              <div>
                <h3 className="font-black uppercase text-lg leading-tight mb-1">Instalar no Celular</h3>
                <p className="text-sm font-bold text-gray-600 mb-4">
                  Acesse suas ferramentas PDF instantaneamente direto da tela inicial.
                </p>

                {isIOS ? (
                  <div className="bg-gray-100 border-2 border-black p-3 text-xs font-black uppercase space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white px-1.5 py-0.5">1</span>
                      Toque em <svg className="inline w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> &quot;Compartilhar&quot;
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white px-1.5 py-0.5">2</span>
                      Selecione &quot;Adicionar à Tela de Início&quot;
                    </div>
                  </div>
                ) : (
                    <button
                      type="button"
                      data-testid="pwa-install-now"
                      onClick={handleInstall}
                      disabled={isInstalling}
                      aria-busy={isInstalling}
                      className="w-full bg-neon-yellow border-4 border-black py-2 px-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0"
                    >
                      {isInstalling ? 'Instalando...' : 'Instalar Agora'}
                    </button>
                  )}
                  {installError ? (
                  <p data-testid="pwa-install-error" role="alert" aria-live="assertive" className="mt-3 text-xs font-black uppercase tracking-widest text-[#b91c1c]">
                    {installError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
