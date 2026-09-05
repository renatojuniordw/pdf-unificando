import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['sharp', 'pdf-lib', '@napi-rs/canvas', 'pdfjs-dist'],
  experimental: {
    // O proxy (src/proxy.ts) clona/bufferiza o body; o default de 10MB
    // truncava uploads >10MB (ex.: juntar 10 PDFs), quebrando o formData().
    // 55mb alinha com o client_max_body_size do nginx; o app rejeita >50MB
    // com JSON 413 antes de atingir esse teto.
    proxyClientMaxBodySize: '55mb',
  },
  async headers() {
    return [
      {
        source: '/api/pdf/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://connect.facebook.net https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.facebook.com https://googleads.g.doubleclick.net; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://www.facebook.com https://graph.facebook.com https://googleads.g.doubleclick.net https://sa.stape.co https://ep1.adtrafficquality.google; font-src 'self' data:; frame-src https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.facebook.com https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ]
  },
}

export default config
