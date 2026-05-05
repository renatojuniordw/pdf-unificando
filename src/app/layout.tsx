import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/index.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConsoleBranding } from '@/components/layout/ConsoleBranding'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { PWARegistration } from '@/components/pwa/PWARegistration'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import Script from 'next/script'
import type { Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = 'https://pdf.unificando.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: 'Unificando PDF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Unificando',
  },
  title: {
    default: 'Unificando PDF — Ferramentas PDF Gratuitas Online',
    template: '%s | Unificando PDF'
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
    url: BASE_URL,
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
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#ccff00',
  width: 'device-width',
  initialScale: 1,
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
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
        <CommandPalette />
        <PWARegistration />
        <PWAInstallBanner />
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NV6BPT7T');`}
        </Script>
      </body>
    </html>
  )
}
