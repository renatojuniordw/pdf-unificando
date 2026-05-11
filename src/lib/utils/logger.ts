type LoggerMeta = Record<string, unknown>

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return '"[unserializable]"'
  }
}

export function logInfo(scope: string, message: string, meta: LoggerMeta = {}): void {
  console.log(
    safeJson({
      level: 'info',
      scope,
      message,
      ...meta,
    }),
  )
}

export function logWarn(scope: string, message: string, meta: LoggerMeta = {}): void {
  console.warn(
    safeJson({
      level: 'warn',
      scope,
      message,
      ...meta,
    }),
  )
}

export function logError(scope: string, error: unknown, meta: LoggerMeta = {}): void {
  const serializedError =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error

  console.error(
    safeJson({
      level: 'error',
      scope,
      ...meta,
      error: serializedError,
    }),
  )
}
