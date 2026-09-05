'use client'

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { tools } from '@/config/tools'
import { getToolIcon } from '@/components/tools/ToolIcons'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useEventListener } from '@/hooks/useEventListener'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const router = useRouter()
  const windowTarget = typeof window === 'undefined' ? null : window

  const filteredTools = useMemo(() => {
    if (query === '') return tools

    const searchQuery = query.toLowerCase()
    return tools.filter((tool) => {
      const searchStr = `${tool.name} ${tool.description}`.toLowerCase()
      return searchStr.includes(searchQuery)
    })
  }, [query])
  const safeSelectedIndex = filteredTools.length === 0 ? 0 : Math.min(selectedIndex, filteredTools.length - 1)

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        returnFocusRef.current = document.activeElement as HTMLElement | null
      }
      return next
    })
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const handleKeyDown = useCallback((event: Event) => {
    const e = event as KeyboardEvent
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      toggle()
    }
    if (e.key === 'Escape') {
      close()
    }
  }, [close, toggle])

  useEventListener(windowTarget, 'keydown', handleKeyDown)
  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      return
    }
    returnFocusRef.current?.focus?.()
    returnFocusRef.current = null
  }, [isOpen])

  const handleSelect = useCallback((slug: string) => {
    router.push(`/ferramentas/${slug}`)
    setIsOpen(false)
  }, [router])

  const handleHover = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (filteredTools.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length)
    } else if (e.key === 'Enter') {
      handleSelect(filteredTools[safeSelectedIndex].slug)
    }
  }, [filteredTools, handleSelect, safeSelectedIndex])

  const trapTab = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return

    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!focusables || focusables.length === 0) return

    const list = Array.from(focusables)
    const first = list[0]
    const last = list[list.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
      return
    }

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  return (
    <>
      <button
        ref={triggerRef}
        data-testid="command-palette-trigger"
        onClick={toggle}
        type="button"
        className="group fixed bottom-6 right-6 z-40 cursor-pointer border-4 border-black bg-neon-yellow p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        aria-label="Abrir busca"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="transition-transform group-hover:scale-110"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]" onKeyDown={trapTab}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              ref={dialogRef}
              data-testid="command-palette-dialog"
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-palette-title"
              className="relative flex w-full max-w-2xl flex-col overflow-hidden border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-start justify-between gap-4 border-b-4 border-black bg-white p-4">
                <h2 id="command-palette-title" className="sr-only">Busca de Ferramentas PDF</h2>
                <button
                  type="button"
                  data-testid="command-palette-close"
                  onClick={close}
                  className="ml-auto border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                  aria-label="Fechar busca"
                >
                  Fechar
                </button>
              </div>

              <div className="flex items-center border-b-4 border-black bg-white p-4" role="combobox" aria-haspopup="listbox" aria-expanded={isOpen} aria-controls="command-palette-results">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="mr-4 text-black"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  data-testid="command-palette-input"
                  type="text"
                  placeholder="Pesquisar ferramentas... (Ex: Juntar, Comprimir)"
                  className="flex-1 border-none bg-transparent outline-none text-xl font-bold uppercase placeholder:text-gray-400"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={onKeyDown}
                  aria-autocomplete="list"
                  aria-controls="command-palette-results"
                  aria-activedescendant={filteredTools.length > 0 ? `tool-${filteredTools[safeSelectedIndex]?.slug ?? filteredTools[0].slug}` : undefined}
                />
                <div className="ml-4 hidden items-center gap-1 sm:flex">
                  <kbd className="border-2 border-black bg-gray-100 px-2 py-1 text-xs font-bold">ESC</kbd>
                </div>
              </div>

              <div className="sr-only" aria-live="polite" role="status">
                {query !== '' && `${filteredTools.length} ferramentas encontradas.`}
              </div>

              <div
                id="command-palette-results"
                data-testid="command-palette-results"
                role="listbox"
                className="max-h-[60vh] overflow-y-auto bg-white"
              >
                {filteredTools.length > 0 ? (
                  <div className="p-2">
                    {filteredTools.map((tool, index) => (
                      <CommandPaletteResult
                        key={tool.slug}
                        tool={tool}
                        index={index}
                        selected={index === safeSelectedIndex}
                        onSelect={handleSelect}
                        onHover={handleHover}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="mb-4 text-4xl">🔍❌</div>
                    <div className="text-xl font-black uppercase">Nenhuma ferramenta encontrada</div>
                    <div className="font-bold text-gray-500">Tente buscar por termos diferentes</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t-4 border-black bg-gray-50 p-4 text-xs font-black uppercase tracking-wider">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="border border-black bg-white px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">↑↓</kbd> Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="border border-black bg-white px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">ENTER</kbd> Abrir
                  </span>
                </div>
                <div className="hidden xs:block">
                  Atalho: <kbd className="border border-black bg-white px-1.5 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">⌘ K</kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

interface CommandPaletteResultProps {
  tool: (typeof tools)[number]
  index: number
  selected: boolean
  onSelect: (slug: string) => void
  onHover: (index: number) => void
}

const CommandPaletteResult = memo(function CommandPaletteResult({
  tool,
  index,
  selected,
  onSelect,
  onHover,
}: CommandPaletteResultProps) {
  const handleClick = useCallback(() => onSelect(tool.slug), [onSelect, tool.slug])
  const handleMouseEnter = useCallback(() => onHover(index), [index, onHover])

  return (
    <button
      type="button"
      id={`tool-${tool.slug}`}
      data-testid={`command-palette-option-${tool.slug}`}
      role="option"
      aria-selected={selected}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`w-full border-2 p-4 transition-colors flex items-center ${
        selected
          ? 'bg-neon-yellow border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className={`mr-4 border-2 border-black p-2 ${selected ? 'bg-white' : 'bg-gray-50'}`}>
        {getToolIcon(tool.icon, 24)}
      </div>
      <div className="text-left">
        <div className="text-lg font-black uppercase leading-tight">{tool.name}</div>
        <div className="line-clamp-1 text-sm font-medium text-gray-600">{tool.description}</div>
      </div>
      {selected && (
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-black uppercase">Selecionar</span>
          <kbd className="border-2 border-black bg-white px-2 py-1 text-[10px] font-bold">ENTER</kbd>
        </div>
      )}
    </button>
  )
})
