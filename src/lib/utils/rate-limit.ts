interface RateLimitConfig {
  limit: number
  windowMs: number
}

const cache = new Map<string, { count: number; expires: number }>()

// Limpeza periódica do cache para evitar vazamento de memória
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.entries()) {
      if (now > value.expires) {
        cache.delete(key)
      }
    }
  }, 60_000) // Limpa a cada minuto
}

export function rateLimit(ip: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const record = cache.get(ip)

  if (!record || now > record.expires) {
    cache.set(ip, { count: 1, expires: now + config.windowMs })
    return true
  }

  if (record.count >= config.limit) {
    return false
  }

  record.count++
  return true
}
