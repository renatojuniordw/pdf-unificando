"use client"

import { useCallback } from "react"
import { trackToolDownload } from "@/lib/analytics"

export function useDownloadTracking(toolName: string, filename: string | null | undefined) {
  return useCallback(() => {
    if (!filename) return
    trackToolDownload(toolName, filename)
  }, [filename, toolName])
}
