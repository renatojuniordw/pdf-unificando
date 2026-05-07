export function parsePageRange(input: string, totalPages: number): number[] {
  const pages: number[] = []
  const parts = input.split(',').map(s => s.trim())

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= totalPages) pages.push(i - 1)
      }
    } else {
      const page = Number(part)
      if (page >= 1 && page <= totalPages) pages.push(page - 1)
    }
  }

  return [...new Set(pages)].sort((a, b) => a - b)
}

export function parseOrder(input: string): number[] {
  return input.split(',').map(n => Number(n.trim()) - 1)
}
