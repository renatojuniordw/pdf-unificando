'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Componente que exibe um banner incentivando a instalação do PWA.
 * Lida com a lógica específica para iOS (instruções manuais) 
 * e Android/Desktop (prompt nativo).
 */
export function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Verificar se já está instalado (standalone)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      // @ts-ignore - navigator.standalone é específico para Safari iOS
      const isIOSStandalone = window.navigator.standalone === true
      setIsStandalone(isStandaloneMode || isIOSStandalone)
    }

    // 2. Detectar iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      setIsIOS(/iphone|ipad|ipod/.test(userAgent))
    }

    // 3. Capturar evento de instalação (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Mostrar o banner se não estiver instalado e não tiver sido fechado nesta sessão
      if (!sessionStorage.getItem('pwa-banner-dismissed')) {
        setTimeout(() => setIsVisible(true), 5000) // Aparece após 5 segundos
      }
    }

    checkStandalone()
    checkIOS()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Para iOS, mostramos o banner mesmo sem o evento nativo
    if (/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) && 
        !sessionStorage.getItem('pwa-banner-dismissed')) {
      setTimeout(() => setIsVisible(true), 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`PWA: Usuário escolheu ${outcome}`)
    
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const dismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
  }

  // Se já estiver instalado, não mostra nada
  if (isStandalone) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40"
        >
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 relative">
            {/* Botão Fechar */}
            <button 
              onClick={dismiss}
              className="absolute -top-4 -right-4 bg-red-500 text-white border-4 border-black w-10 h-10 flex items-center justify-center font-black hover:scale-110 transition-transform cursor-pointer"
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
                      Toque em <svg className="inline w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> "Compartilhar"
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white px-1.5 py-0.5">2</span>
                      Selecione "Adicionar à Tela de Início"
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleInstall}
                    className="w-full bg-neon-yellow border-4 border-black py-2 px-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  >
                    Instalar Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
