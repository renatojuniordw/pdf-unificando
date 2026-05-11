const PAGE_RANGE_PATTERN = /^\s*\d+\s*(?:-\s*\d+\s*)?(?:,\s*\d+\s*(?:-\s*\d+\s*)?)*$/

export function validatePageRangeSyntax(value: string): string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (!PAGE_RANGE_PATTERN.test(trimmed)) {
    return "Formato inválido. Use algo como 1-3, 5, 7-9."
  }

  const segments = trimmed.split(",").map((part) => part.trim())

  for (const segment of segments) {
    const [startText, endText] = segment.split("-").map((part) => part.trim())

    if (!startText) {
      return "Formato inválido. Use algo como 1-3, 5, 7-9."
    }

    const start = Number(startText)
    const end = endText ? Number(endText) : start

    if (!Number.isInteger(start) || start < 1) {
      return "Use apenas números inteiros positivos."
    }

    if (!Number.isInteger(end) || end < 1) {
      return "Use apenas números inteiros positivos."
    }

    if (end < start) {
      return "O intervalo final precisa ser maior ou igual ao inicial."
    }
  }

  return null
}

export function normalizePageRange(value: string): string {
  return value.trim()
}
