'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { tools } from '@/config/tools'
import { getToolIcon } from '@/components/tools/ToolIcons'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filteredTools = query === ''
    ? tools
    : tools.filter((tool) => {
        const searchStr = `${tool.name} ${tool.description}`.toLowerCase()
        return searchStr.includes(query.toLowerCase())
      })

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      // Lock scroll
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSelect = (slug: string) => {
    router.push(`/ferramentas/${slug}`)
    setIsOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length)
    } else if (e.key === 'Enter') {
      if (filteredTools.length > 0) {
        handleSelect(filteredTools[selectedIndex].slug)
      }
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 p-4 bg-neon-yellow border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer group"
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
          className="group-hover:scale-110 transition-transform"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center border-b-4 border-black p-4 bg-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="mr-4 text-black"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Pesquisar ferramentas... (Ex: Juntar, Comprimir)"
                  className="flex-1 bg-transparent border-none outline-none text-xl font-bold uppercase placeholder:text-gray-400"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  onKeyDown={onKeyDown}
                />
                <div className="hidden sm:flex items-center gap-1 ml-4">
                  <kbd className="px-2 py-1 bg-gray-100 border-2 border-black text-xs font-bold">ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto bg-white">
                {filteredTools.length > 0 ? (
                  <div className="p-2">
                    {filteredTools.map((tool, index) => (
                      <button
                        key={tool.slug}
                        onClick={() => handleSelect(tool.slug)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center p-4 transition-colors border-2 ${
                          index === selectedIndex
                            ? 'bg-neon-yellow border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]'
                            : 'bg-transparent border-transparent'
                        }`}
                      >
                        <div className={`p-2 border-2 border-black mr-4 ${index === selectedIndex ? 'bg-white' : 'bg-gray-50'}`}>
                          {getToolIcon(tool.icon, 24)}
                        </div>
                        <div className="text-left">
                          <div className="font-black uppercase text-lg leading-tight">{tool.name}</div>
                          <div className="text-sm font-medium text-gray-600 line-clamp-1">{tool.description}</div>
                        </div>
                        {index === selectedIndex && (
                          <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs font-black uppercase">Selecionar</span>
                            <kbd className="px-2 py-1 bg-white border-2 border-black text-[10px] font-bold">ENTER</kbd>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-4">🔍❌</div>
                    <div className="font-black uppercase text-xl">Nenhuma ferramenta encontrada</div>
                    <div className="text-gray-500 font-bold">Tente buscar por termos diferentes</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t-4 border-black flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">↑↓</kbd> Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">ENTER</kbd> Abrir
                  </span>
                </div>
                <div>
                  Atalho: <kbd className="px-1.5 py-0.5 bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">⌘ K</kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
