'use client'

import { useState, useCallback, useRef } from 'react'
import type { ProcessingStatus } from '@/types/pdf'
import { useRetryCountdown } from './useRetryCountdown'

interface UseFileProcessorOptions {
  endpoint: string
  outputFilename?: string | ((originalName: string) => string)
}

interface UseFileProcessorReturn {
  status: ProcessingStatus
  error: string | null
  downloadUrl: string | null
  outputName: string | null
  originalSize: number | null
  processedSize: number | null
  process: (files: File | File[], extraData?: Record<string, string>) => Promise<void>
  reset: () => void
  secondsLeft: number
  isBlocked: boolean
  progress: number
}

export function useFileProcessor({ endpoint, outputFilename }: UseFileProcessorOptions): UseFileProcessorReturn {
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [outputName, setOutputName] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number | null>(null)
  const [processedSize, setProcessedSize] = useState<number | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const { secondsLeft, isBlocked, progress, startCountdown, reset: resetCountdown } = useRetryCountdown()

  const process = useCallback(async (files: File | File[], extraData?: Record<string, string>) => {
    const fileArray = Array.isArray(files) ? files : [files]
    const firstFile = fileArray[0]

    setStatus('uploading')
    setError(null)
    setDownloadUrl(null)
    setOutputName(null)
    setOriginalSize(fileArray.reduce((acc, f) => acc + f.size, 0))
    setProcessedSize(null)

    try {
      const formData = new FormData()
      fileArray.forEach(f => formData.append('file', f))
      if (extraData) {
        Object.entries(extraData).forEach(([k, v]) => formData.append(k, v))
      }

      setStatus('processing')

      const res = await fetch(endpoint, { method: 'POST', body: formData })

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') ?? '30', 10)
        startCountdown(retryAfter)
        setStatus('rate_limited')
        return
      }

      if (res.status === 413) {
        setError('Arquivo muito grande. Limite: 50MB.')
        setStatus('error')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Erro desconhecido.' }))
        setError(body.error ?? 'Erro ao processar arquivo.')
        setStatus('error')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      objectUrlRef.current = url

      const name = typeof outputFilename === 'function'
        ? outputFilename(firstFile.name)
        : outputFilename ?? firstFile.name

      setDownloadUrl(url)
      setOutputName(name)
      setProcessedSize(blob.size)
      setStatus('done')
    } catch {
      setError('Erro de conexão. Verifique sua internet.')
      setStatus('error')
    }
  }, [endpoint, outputFilename, startCountdown])

  const reset = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setStatus('idle')
    setError(null)
    setDownloadUrl(null)
    setOutputName(null)
    setOriginalSize(null)
    setProcessedSize(null)
    resetCountdown()
  }, [resetCountdown])

  return {
    status,
    error,
    downloadUrl,
    outputName,
    originalSize,
    processedSize,
    process,
    reset,
    secondsLeft,
    isBlocked,
    progress,
  }
}
