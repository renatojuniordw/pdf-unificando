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
