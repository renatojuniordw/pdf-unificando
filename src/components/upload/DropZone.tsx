"use client"

import { useCallback, useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'

interface DropZoneProps {
  accept: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  onDrop: (files: File[]) => void
  onError?: (message: string) => void
}

function matchesAccept(file: File, accept: Record<string, string[]>): boolean {
  const mimeType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  return Object.entries(accept).some(([mimePattern, extensions]) => {
    const normalizedPattern = mimePattern.toLowerCase()
      const mimeMatches =
        normalizedPattern === "*/*" ||
        mimeType === normalizedPattern ||
        (normalizedPattern.endsWith("/*") &&
          mimeType.startsWith(normalizedPattern.slice(0, normalizedPattern.indexOf("/") + 1)))

    if (mimeMatches) return true

    return extensions.some((extension) => fileName.endsWith(extension.toLowerCase()))
  })
}

function validateFiles(files: File[], accept: Record<string, string[]>, maxSize: number) {
  const accepted: File[] = []
  let hasOversized = false
  let hasUnsupported = false

  for (const file of files) {
    if (file.size > maxSize) {
      hasOversized = true
      continue
    }

    if (!matchesAccept(file, accept)) {
      hasUnsupported = true
      continue
    }

    accepted.push(file)
  }

  return { accepted, hasOversized, hasUnsupported }
}

function buildFeedbackMessage({
  maxSize,
  hasOversized,
  hasUnsupported,
  acceptedCount,
}: {
  maxSize: number
  hasOversized: boolean
  hasUnsupported: boolean
  acceptedCount: number
}) {
  const sizeMessage = `Arquivo muito grande. Limite: ${Math.round(maxSize / 1024 / 1024)}MB.`

  if (!acceptedCount && hasOversized && hasUnsupported) {
    return `${sizeMessage} Também houve arquivos incompatíveis com este formato.`
  }

  if (!acceptedCount && hasOversized) {
    return sizeMessage
  }

  if (!acceptedCount && hasUnsupported) {
    return "Arquivo inválido para esta ferramenta. Selecione um tipo compatível."
  }

  if (hasOversized || hasUnsupported) {
    return "Alguns arquivos foram ignorados por tipo ou tamanho."
  }

  return null
}

export function DropZone({ accept, maxSize = 50 * 1024 * 1024, multiple = false, disabled = false, onDrop, onError }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const feedbackId = useId()

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const allFiles = Array.from(e.dataTransfer.files)
    const { accepted, hasOversized, hasUnsupported } = validateFiles(allFiles, accept, maxSize)
    const files = multiple ? accepted : accepted.slice(0, 1)
    const message = buildFeedbackMessage({
      maxSize,
      hasOversized,
      hasUnsupported,
      acceptedCount: files.length,
    })

    if (!files.length) {
      if (message) {
        setFeedback(message)
        onError?.(message)
      }
      return
    }
    setFeedback(message)
    onDrop(files)
    if (message) onError?.(message)
  }, [accept, disabled, maxSize, multiple, onDrop, onError])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const allFiles = Array.from(e.target.files)
    const { accepted, hasOversized, hasUnsupported } = validateFiles(allFiles, accept, maxSize)
    const files = multiple ? accepted : accepted.slice(0, 1)
    const message = buildFeedbackMessage({
      maxSize,
      hasOversized,
      hasUnsupported,
      acceptedCount: files.length,
    })
    if (!files.length) {
      if (message) {
        setFeedback(message)
        onError?.(message)
      }
      e.target.value = ''
      return
    }
    setFeedback(message)
    onDrop(files)
    if (message) onError?.(message)
    e.target.value = ''
  }, [accept, maxSize, multiple, onDrop, onError])

  const acceptStr = Object.values(accept).flat().join(',')
  const openFilePicker = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openFilePicker()
    }
  }, [disabled, openFilePicker])

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-describedby={`${hintId}${feedback ? ` ${feedbackId}` : ''}`}
      className={`
        relative flex flex-col items-center justify-center p-12 cursor-pointer
        border-4 border-dashed transition-all
        ${isDragOver
          ? 'border-solid border-[#ccff00] bg-[#ccff00] shadow-[8px_8px_0px_#000]'
          : 'border-slate-950 bg-white shadow-[8px_8px_0px_#000]'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFilePicker}
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={acceptStr}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
      />
      {/* Honeypot: invisível para humanos, bots preenchem automaticamente */}
      <input
        type="text"
        name="_hp"
        data-honeypot=""
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />

      {isDragOver ? (
        <p className="text-slate-950 font-black uppercase tracking-tighter text-xl">SOLTE AQUI</p>
      ) : (
        <>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" className="mb-4 text-slate-950">
            <path d="M24 32V16M16 24l8-8 8 8" />
            <rect x="8" y="8" width="32" height="32" />
          </svg>
          <p className="font-black uppercase tracking-tighter text-xl text-slate-950 text-center">
            ARRASTE OU CLIQUE
          </p>
          <p id={hintId} className="text-xs font-mono uppercase tracking-widest text-slate-600 mt-2 text-center">
            Máximo {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </>
      )}

      {feedback && (
        <p id={feedbackId} role="status" aria-live="polite" className="mt-4 text-xs font-black uppercase tracking-widest text-[#b91c1c] text-center">
          {feedback}
        </p>
      )}
    </div>
  )
}
