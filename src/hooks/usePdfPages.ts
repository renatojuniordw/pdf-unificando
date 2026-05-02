'use client'

import { useState, useCallback } from 'react'

export interface PageThumbnail {
  index: number
  dataUrl: string
}

interface UsePdfPagesReturn {
  pages: PageThumbnail[]
  loading: boolean
  error: string | null
  loadFile: (file: File) => Promise<void>
}

export function usePdfPages(): UsePdfPagesReturn {
  const [pages, setPages] = useState<PageThumbnail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setPages([])

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const thumbs: PageThumbnail[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.4 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, canvas, viewport }).promise
        thumbs.push({ index: i - 1, dataUrl: canvas.toDataURL() })
      }

      setPages(thumbs)
    } catch {
      setError('Erro ao carregar o PDF.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { pages, loading, error, loadFile }
}
