import React from 'react'
import { siteUrl } from '@/lib/site'

interface JsonLdProps {
  data: Record<string, unknown>
}

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  )
}

export function generateWebApplicationSchema(tool: {
  name: string
  description: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} | Unificando PDF`,
    description: tool.description,
    url: siteUrl(`/ferramentas/${tool.slug}`),
    applicationCategory: 'PDF Tool',
    operatingSystem: 'Windows, macOS, Linux, Android, iOS',
    browserRequirements: 'Requires a modern web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    brand: {
      '@type': 'Brand',
      name: 'Unificando PDF',
    },
    featureList: [
      '100% Grátis',
      'Sem cadastro',
      'Privacidade garantida',
      'Processamento instantâneo',
    ],
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Unificando',
    alternateName: ['PDF Unificando', 'Unificando PDF'],
    url: siteUrl('/'),
    logo: siteUrl('/icon.png'),
    description: 'A Unificando PDF oferece ferramentas gratuitas e seguras para gerenciamento de arquivos PDF online.',
    sameAs: [
      'https://github.com/renatojuniordw',
      // Adicione outras redes sociais aqui
    ],
  }
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Unificando PDF',
    url: siteUrl('/'),
    potentialAction: {
      '@type': 'SearchAction',
      // Busca real do site: /tutoriais?q=
      target: `${siteUrl('/tutoriais')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateArticleSchema(article: {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    mainEntityOfPage: siteUrl(`/tutoriais/${article.slug}`),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Unificando',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Unificando',
      logo: {
        '@type': 'ImageObject',
        url: siteUrl('/icon.png'),
      },
    },
  }
}

export function generateHowToSchema(tutorial: {
  title: string
  description: string
  slug: string
  steps: { title: string; description: string }[]
  estimatedTime: string
}) {
  // Convert '2 min' to ISO 8601 duration format (e.g., PT2M)
  const minutes = parseInt(tutorial.estimatedTime) || 1
  const isoDuration = `PT${minutes}M`

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tutorial.title,
    description: tutorial.description,
    totalTime: isoDuration,
    step: tutorial.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      itemListElement: [
        {
          '@type': 'HowToDirection',
          text: step.description,
        },
      ],
      url: `${siteUrl(`/tutoriais/${tutorial.slug}`)}#step-${index + 1}`,
    })),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
