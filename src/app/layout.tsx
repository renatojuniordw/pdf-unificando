import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/index.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConsoleBranding } from '@/components/layout/ConsoleBranding'
import { CommandPalette } from '@/components/layout/CommandPalette'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = 'https://pdf.unificando.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
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
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <ConsoleBranding />
        <Header />
        <main>{children}</main>
        <Footer />
        <CommandPalette />
      </body>
    </html>
  )
}
