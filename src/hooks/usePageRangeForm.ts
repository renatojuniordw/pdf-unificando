"use client"

import { useMemo, useState } from "react"
import { normalizePageRange, validatePageRangeSyntax } from "@/lib/pdf/page-range"

interface UsePageRangeFormOptions {
  initialValue?: string
}

export function usePageRangeForm({
  initialValue = "",
}: UsePageRangeFormOptions = {}) {
  const [value, setValue] = useState(initialValue)

  const error = useMemo(() => {
    const trimmed = normalizePageRange(value)
    return trimmed ? validatePageRangeSyntax(trimmed) : null
  }, [value])

  return {
    value,
    setValue,
    error,
    isValid: !error,
    normalizedValue: normalizePageRange(value),
  }
}
