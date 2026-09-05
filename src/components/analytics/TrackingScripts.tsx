'use client'

import { useEffect, useState } from 'react'
import { CONSENT_EVENT, readConsent } from '@/lib/consent'

/**
 * Carrega os scripts de terceiros (GA4, GTM, Meta Pixel, AdSense) SOMENTE após
 * o consentimento do usuário. Injeção dinâmica no cliente para não disparar
 * rede antes da decisão (LGPD Art. 7º e guias ANPD).
 */

// IDs configuráveis por env (NEXT_PUBLIC_*), com fallback para os atuais.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-WDL8Q73DPM'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5FJHKG2C'
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1491713342606274'
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-6897422992813570'

function injectScript(src: string): void {
  if (document.querySelector(`script[data-tracking-src="${src}"]`)) return
  const el = document.createElement('script')
  el.src = src
  el.async = true
  el.crossOrigin = 'anonymous'
  el.setAttribute('data-tracking-src', src)
  el.setAttribute('data-consent', 'granted')
  document.head.appendChild(el)
}

function injectAdSense(src: string): void {
  // AdSense não aceita atributos data-* no head tag; injeta limpo para evitar warnings
  if (document.querySelector(`script[data-tracking-src="${src}"]`)) return
  const el = document.createElement('script')
  el.src = src
  el.async = true
  el.crossOrigin = 'anonymous'
  el.setAttribute('data-tracking-src', src)
  document.head.appendChild(el)
}

function injectInline(id: string, code: string): void {
  if (document.getElementById(id)) return
  const el = document.createElement('script')
  el.id = id
  el.setAttribute('data-consent', 'granted')
  el.textContent = code
  document.head.appendChild(el)
}

export function TrackingScripts() {
  const [enabled, setEnabled] = useState(() => readConsent() === 'accepted')

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail
      setEnabled(detail === 'accepted')
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (!enabled) return

    // Google Analytics 4
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`)
    injectInline(
      'ga4-init',
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
    )

    // Google Tag Manager
    injectInline(
      'gtm-script',
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
    )

    // Meta Pixel
    injectInline(
      'meta-pixel',
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
    )

    // Google AdSense
    injectAdSense(
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`,
    )
  }, [enabled])

  return null
}