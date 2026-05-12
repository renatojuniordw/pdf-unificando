import type { Metadata } from 'next'
import '@/styles/index.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConsoleBranding } from '@/components/layout/ConsoleBranding'
import { ClientChrome } from '@/components/layout/ClientChrome'
import Script from 'next/script'
import type { Viewport } from 'next'
import { SITE_URL } from '@/lib/site'

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_ID ?? 'ca-pub-6897422992813570'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Unificando PDF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Unificando',
  },
  title: {
    default: 'Unificando PDF — Ferramentas PDF Gratuitas Online',
    template: '%s | Unificando PDF',
  },
  description: 'Comprima, junte, divida e converta PDFs online grátis. Sem cadastro, sem limites e com segurança máxima. Seus arquivos não são armazenados.',
  keywords: ['unificar pdf', 'juntar pdf', 'comprimir pdf', 'converter pdf', 'pdf para word', 'pdf para jpg', 'dividir pdf', 'rodar pdf'],
  authors: [{ name: 'Unificando' }],
  creator: 'Unificando',
  publisher: 'Unificando',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Unificando PDF — Ferramentas PDF Gratuitas Online',
    description: 'A maneira mais rápida e segura de gerenciar seus arquivos PDF online e totalmente grátis.',
    url: SITE_URL,
    siteName: 'Unificando PDF',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unificando PDF — Ferramentas PDF Gratuitas Online',
    description: 'Comprima, junte, divida e converta PDFs online grátis sem cadastro.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'mzCsSCYc1DwIFe-ucUtkISy2Fovv39sxKjMmkMO1ffM',
  },
  other: ADSENSE_CLIENT_ID
    ? {
        'google-adsense-account': ADSENSE_CLIENT_ID,
      }
    : undefined,
  icons: {
    icon: '/icon.png?v=2',
    apple: '/icon.png?v=2',
  },
}

export const viewport: Viewport = {
  themeColor: '#ccff00',
  width: 'device-width',
  initialScale: 1,
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {ADSENSE_CLIENT_ID ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5FJHKG2C" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        <a
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-neon-yellow focus:text-black focus:border-4 focus:border-black focus:font-black focus:uppercase focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Pular para o conteúdo
        </a>
        <ConsoleBranding />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <ClientChrome />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WDL8Q73DPM"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-WDL8Q73DPM');`}
        </Script>
        <Script id="gtm-script" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5FJHKG2C');`}
        </Script>
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1491713342606274');fbq('track','PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1491713342606274&ev=PageView&noscript=1" alt="" />
        </noscript>
      </body>
    </html>
  )
}
