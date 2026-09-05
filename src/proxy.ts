import { createHash, timingSafeEqual } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { apiErrorResponse } from '@/lib/utils/http'
import { logWarn } from '@/lib/utils/logger'

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function proxy(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next()

  const requestId = req.headers.get('x-request-id') ?? globalThis.crypto.randomUUID()
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const allowedOrigin =
    normalizeOrigin(process.env.ALLOWED_ORIGIN) ??
    normalizeOrigin(req.nextUrl?.origin) ??
    (() => {
      const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host')
      if (!forwardedHost) return null
      const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
      return normalizeOrigin(`${forwardedProto}://${forwardedHost}`)
    })()
  const requestOrigin = normalizeOrigin(origin) ?? normalizeOrigin(referer)

  if (requestOrigin && allowedOrigin) {
    const isLocal = requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')

    if (requestOrigin !== allowedOrigin && !isLocal) {
      logWarn('CORS', 'Requisição bloqueada por origem diferente.', {
        requestId,
        origin: requestOrigin,
        allowedOrigin,
      })
      return apiErrorResponse(
        403,
        'FORBIDDEN',
        'Acesso não permitido.',
        { reason: 'origin_not_allowed' },
        false,
        { 'X-Request-Id': requestId },
      )
    }
  }

  const apiKey = process.env.API_SECRET_KEY
  if (apiKey) {
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    // Comparação timing-safe para reduzir risco de timing attack na chave.
    if (!token || !safeTimingEqual(token, apiKey)) {
      return apiErrorResponse(
        401,
        'UNAUTHORIZED',
        'Não autorizado.',
        { reason: 'invalid_api_key' },
        false,
        { 'X-Request-Id': requestId },
      )
    }
  }

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers.entries()),
        'x-request-id': requestId,
      }),
    },
  })
  response.headers.set('X-Request-Id', requestId)
  return response
}

function safeTimingEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // timingSafeEqual exige buffers de mesmo tamanho; normaliza por hash SHA-256
  // para comparar em tempo constante independente do comprimento real.
  const digestA = createHash('sha256').update(bufA).digest()
  const digestB = createHash('sha256').update(bufB).digest()
  return timingSafeEqual(digestA, digestB)
}

export const config = {
  matcher: '/api/pdf/:path*',
}
