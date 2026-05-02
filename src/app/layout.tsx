import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/index.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Unificando PDF Tools — Ferramentas PDF gratuitas online',
  description: 'Comprima, junte, divida e converta PDFs online grátis. Sem cadastro. Seus arquivos não são armazenados.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
