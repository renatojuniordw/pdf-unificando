"use client"

import { useMemo } from "react"

export function useTextStats(text: string) {
  return useMemo(() => {
    const trimmed = text.trim()
    return {
      wordCount: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0,
      characterCount: text.length,
    }
  }, [text])
}
