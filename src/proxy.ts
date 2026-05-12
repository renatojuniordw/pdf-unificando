import { NextResponse, type NextRequest } from 'next/server'
import { apiErrorResponse } from '@/lib/utils/http'
import { logWarn } from '@/lib/utils/logger'

export function proxy(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next()

  const requestId = req.headers.get('x-request-id') ?? globalThis.crypto.randomUUID()
  const origin = req.headers.get('origin')
  const envAllowedOrigin = process.env.ALLOWED_ORIGIN
  const isProduction = process.env.NODE_ENV === 'production'
  const allowedOrigin =
    envAllowedOrigin ||
    (!isProduction
      ? `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('x-forwarded-host') || req.headers.get('host')}`
      : null)

  if (!allowedOrigin) {
    logWarn('CORS', 'ALLOWED_ORIGIN não configurado em produção.', { requestId })
    return apiErrorResponse(
      500,
      'INTERNAL_ERROR',
      'Configuração de origem ausente.',
      { reason: 'missing_allowed_origin' },
      false,
      { 'X-Request-Id': requestId },
    )
  }

  if (origin) {
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')

    if (origin !== allowedOrigin && !isLocal) {
      logWarn('CORS', 'Requisição bloqueada por origem diferente.', {
        requestId,
        origin,
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

  const apiKey = process.env.API_SECRET_KEY
  if (apiKey) {
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (token !== apiKey) {
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

export const config = {
  matcher: '/api/pdf/:path*',
}
