import { beforeEach, describe, expect, it, vi } from 'vitest'
import { proxy } from '@/proxy'

function buildRequest(headers: Record<string, string> = {}) {
  const url = new URL('https://pdf.unificando.com.br/api/pdf/compress')

  return {
    method: 'POST',
    headers: new Headers(headers),
    nextUrl: url,
    url: url.toString(),
  } as Parameters<typeof proxy>[0]
}

describe('proxy', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('permite POST do próprio domínio mesmo sem ALLOWED_ORIGIN', () => {
    vi.stubEnv('NODE_ENV', 'production')

    const response = proxy(
      buildRequest({
        referer: 'https://pdf.unificando.com.br/ferramentas/comprimir-pdf',
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBeNull()
  })

  it('bloqueia origem diferente quando a origem é conhecida', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ALLOWED_ORIGIN', 'https://pdf.unificando.com.br')

    const response = proxy(
      buildRequest({
        origin: 'https://malicious.example',
        referer: 'https://malicious.example/form',
      }),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Acesso não permitido.',
        details: { reason: 'origin_not_allowed' },
      },
    })
  })
})
