import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['sharp', 'pdf-lib', '@napi-rs/canvas', 'pdfjs-dist'],
  async headers() {
    return [
      {
        source: '/api/pdf/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
}

export default config
