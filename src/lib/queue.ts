import pLimit from 'p-limit'

const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT_JOBS ?? 2)
const MAX_QUEUE = Number(process.env.MAX_QUEUE_SIZE ?? 5)

export const RETRY_AFTER = Number(process.env.RETRY_AFTER_SECONDS ?? 30)

// Usado APENAS para operações com binários externos (Ghostscript, LibreOffice, pdftoppm)
export const binaryLimit = pLimit(MAX_CONCURRENT)

export function isOverloaded(): boolean {
  return binaryLimit.activeCount + binaryLimit.pendingCount >= MAX_CONCURRENT + MAX_QUEUE
}

export function rateLimitResponse(): Response {
  return Response.json(
    { error: 'Servidor ocupado. Tente novamente em instantes.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(RETRY_AFTER),
        'X-Queue-Active': String(binaryLimit.activeCount),
        'X-Queue-Pending': String(binaryLimit.pendingCount),
      },
    }
  )
}
