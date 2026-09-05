"use client"

import { useCallback, useState } from 'react'

export interface PageThumbnail {
  index: number
  dataUrl: string
}

interface UsePdfPagesReturn {
  pages: PageThumbnail[]
  loading: boolean
  error: string | null
  progress: number
  currentPage: number
  totalPages: number
  loadFile: (file: File) => Promise<PageThumbnail[]>
}

export function friendlyPdfError(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Não foi possível gerar as miniaturas deste PDF.'
  }

  const message = err.message.trim()
  const normalized = message.toLowerCase()

  if (
    normalized.includes('canvas') ||
    normalized.includes('worker') ||
    normalized.includes('render')
  ) {
    return 'Não foi possível gerar as miniaturas deste PDF.'
  }

  if (normalized.includes('password') || normalized.includes('encrypted')) {
    return 'Este PDF parece estar protegido por senha.'
  }

  return message || 'Não foi possível gerar as miniaturas deste PDF.'
}

export async function renderPdfThumbnails(
  file: File,
  onProgress?: (currentPage: number, totalPages: number) => void,
): Promise<PageThumbnail[]> {
  const pdfjsLib = await import("pdfjs-dist")
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  try {
    const thumbs: PageThumbnail[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 0.4 })
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Não foi possível criar o canvas para renderização.")
      }

      await page.render({ canvasContext: ctx, canvas, viewport }).promise
      thumbs.push({ index: i - 1, dataUrl: canvas.toDataURL() })
      onProgress?.(i, pdf.numPages)
    }

    return thumbs
  } finally {
    try {
      await loadingTask.destroy()
    } catch {
      // Ignora falha de limpeza para não esconder o erro original.
    }
  }
}

export function usePdfPages(): UsePdfPagesReturn {
  const [pages, setPages] = useState<PageThumbnail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const loadFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setPages([])
    setProgress(0)
    setCurrentPage(0)
    setTotalPages(0)

    try {
      const thumbs = await renderPdfThumbnails(file, (current, total) => {
        setTotalPages(total)
        setCurrentPage(current)
        setProgress(current / total)
      })
      setPages(thumbs)
      return thumbs
    } catch (err) {
      setError(friendlyPdfError(err))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { pages, loading, error, progress, currentPage, totalPages, loadFile }
}
