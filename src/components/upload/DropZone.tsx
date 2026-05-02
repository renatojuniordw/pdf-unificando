'use client'

import { useCallback, useState } from 'react'

interface DropZoneProps {
  accept: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  onDrop: (files: File[]) => void
}

export function DropZone({ accept, maxSize = 50 * 1024 * 1024, multiple = false, disabled = false, onDrop }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files).filter(f => f.size <= maxSize)
    if (files.length) onDrop(multiple ? files : [files[0]])
  }, [disabled, maxSize, multiple, onDrop])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).filter(f => f.size <= maxSize)
    if (files.length) onDrop(multiple ? files : [files[0]])
    e.target.value = ''
  }, [maxSize, multiple, onDrop])

  const acceptStr = Object.values(accept).flat().join(',')

  return (
    <label
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
    >
      <input
        type="file"
        className="sr-only"
        accept={acceptStr}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
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
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-2 text-center">
            Máximo {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </>
      )}
    </label>
  )
}
