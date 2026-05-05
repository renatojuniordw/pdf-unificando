import React from 'react'

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
    name: tool.name,
    description: tool.description,
    url: `https://pdf.unificando.com.br/ferramentas/${tool.slug}`,
    applicationCategory: 'PDF Tool',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    featureList: [
      'Grátis',
      'Sem cadastro',
      'Privacidade garantida',
      'Rápido',
    ],
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Unificando',
    url: 'https://pdf.unificando.com.br',
    logo: 'https://pdf.unificando.com.br/icon.png',
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
    url: 'https://pdf.unificando.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://pdf.unificando.com.br/?q={search_term_string}',
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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    mainEntityOfPage: `https://pdf.unificando.com.br/tutoriais/${article.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Unificando',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Unificando',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pdf.unificando.com.br/icon.png',
      },
    },
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
