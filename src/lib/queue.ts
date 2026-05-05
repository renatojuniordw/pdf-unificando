import pLimit from 'p-limit'
import { type NextRequest } from 'next/server'
import { rateLimit } from './utils/rate-limit'

const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT_JOBS ?? 2)
const MAX_QUEUE = Number(process.env.MAX_QUEUE_SIZE ?? 5)

export const RETRY_AFTER = Number(process.env.RETRY_AFTER_SECONDS ?? 30)

// Usado APENAS para operações com binários externos (Ghostscript, LibreOffice, pdftoppm)
export const binaryLimit = pLimit(MAX_CONCURRENT)

export function isOverloaded(): boolean {
  return binaryLimit.activeCount + binaryLimit.pendingCount >= MAX_CONCURRENT + MAX_QUEUE
}

export function validateRateLimit(req: NextRequest, limit = 5, windowMs = 60_000) {
  // 1. IP Rate Limit
  // x-real-ip é setado pelo nginx com $remote_addr (não forjável pelo cliente)
  // x-forwarded-for pode conter IPs forjados no início da cadeia — evitado aqui
  const ip = req.headers.get('x-real-ip') ?? 'unknown'
  const isAllowed = rateLimit(ip, { limit, windowMs })
  
  if (!isAllowed) {
    console.warn(`[RateLimit] IP bloqueado: ${ip}`)
    throw Object.assign(new Error('Muitas requisições. Tente novamente em 1 minuto.'), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) },
    })
  }

  // 2. Server Load Limit (Global)
  if (isOverloaded()) {
    console.warn(`[RateLimit] Servidor sobrecarregado — active: ${binaryLimit.activeCount}, pending: ${binaryLimit.pendingCount}`)
    throw Object.assign(new Error('Servidor ocupado. Tente novamente em instantes.'), {
      status: 429,
      headers: { 'Retry-After': String(RETRY_AFTER) }
    })
  }
}
