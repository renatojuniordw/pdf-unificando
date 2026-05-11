import type { MetadataRoute } from 'next'
import { tools } from '@/config/tools'
import { tutorials } from '@/config/tutorials'
import { SITE_URL, siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: siteUrl('/tutoriais'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: siteUrl('/privacidade'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...tools.map(t => ({
      url: siteUrl(`/ferramentas/${t.slug}`),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...tutorials.map((tutorial) => ({
      url: siteUrl(`/tutoriais/${tutorial.slug}`),
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ]
}
