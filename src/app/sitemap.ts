import type { MetadataRoute } from 'next'
import { tools } from '@/config/tools'
import { tutorials } from '@/config/tutorials'

const BASE = 'https://pdf.unificando.com.br'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/tutoriais`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...tools.map(t => ({
      url: `${BASE}/ferramentas/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...tutorials.map((tutorial) => ({
      url: `${BASE}/tutoriais/${tutorial.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ]
}
