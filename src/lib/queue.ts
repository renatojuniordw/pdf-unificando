import pLimit from 'p-limit'
import { type NextRequest } from 'next/server'
import { rateLimit } from './utils/rate-limit'
import { createApiError } from './utils/http'
import { logWarn } from './utils/logger'

const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT_JOBS ?? 2)
const MAX_QUEUE = Number(process.env.MAX_QUEUE_SIZE ?? 5)

export const RETRY_AFTER = Number(process.env.RETRY_AFTER_SECONDS ?? 30)

// Usado APENAS para operações com binários externos (Ghostscript, LibreOffice, pdftoppm)
export const binaryLimit = pLimit(MAX_CONCURRENT)

export function isOverloaded(): boolean {
  return binaryLimit.activeCount + binaryLimit.pendingCount >= MAX_CONCURRENT + MAX_QUEUE
}

export function validateRateLimit(req: NextRequest, limit = 5, windowMs = 60_000) {
  const requestId = req.headers.get('x-request-id') ?? undefined

  // 1. IP Rate Limit
  // x-real-ip é setado pelo nginx com $remote_addr (não forjável pelo cliente).
  // Em dev/standalone sem nginx, cai no x-forwarded-for (primeiro hop) como fallback.
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  const isAllowed = rateLimit(ip, { limit, windowMs })

  if (!isAllowed) {
    logWarn('RateLimit', 'IP bloqueado', { ip, requestId })
    throw createApiError(
      429,
      'RATE_LIMITED',
      'Muitas requisições. Tente novamente em 1 minuto.',
      { reason: 'ip_rate_limited' },
      true,
      { 'Retry-After': String(Math.ceil(windowMs / 1000)) },
    )
  }

  // 2. Server Load Limit (Global)
  if (isOverloaded()) {
    logWarn('RateLimit', 'Servidor sobrecarregado', {
      active: binaryLimit.activeCount,
      pending: binaryLimit.pendingCount,
      requestId,
    })
    throw createApiError(
      429,
      'RATE_LIMITED',
      'Servidor ocupado. Tente novamente em instantes.',
      { reason: 'server_overloaded' },
      true,
      { 'Retry-After': String(RETRY_AFTER) },
    )
  }
}
