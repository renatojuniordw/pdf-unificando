import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Unificando PDF — Ferramentas Gratuitas',
    short_name: 'Unificando',
    description: 'Comprima, unifique e converta PDFs com facilidade e segurança.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ccff00',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
