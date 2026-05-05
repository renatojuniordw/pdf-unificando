'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tools } from '@/config/tools'
import { getToolIcon } from '../tools/ToolIcons'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 h-16 bg-slate-950 border-b-4 border-[#ccff00] flex items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="bg-[#ccff00] p-2 border-2 border-slate-950 shadow-[4px_4px_0px_#fff] group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_#fff] transition-all">
              <span className="font-black text-slate-950 text-sm uppercase tracking-tighter leading-none">PDF</span>
            </div>
            <span className="font-black text-white text-sm uppercase tracking-widest hidden sm:block">Unificando</span>
          </Link>
          <div className="hidden lg:flex items-center ml-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mr-2">Um projeto</span>
            <a 
              href="https://unificando.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-950 px-2 py-0.5 border border-slate-950 text-[9px] font-black uppercase tracking-widest hover:bg-[#ccff00] transition-colors"
            >
              Unificando.com.br
            </a>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 h-full">
          {/* Ferramentas Dropdown */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
            ref={dropdownRef}
          >
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              aria-expanded={toolsOpen}
              aria-controls="tools-dropdown"
              aria-haspopup="true"
              className={`text-xs font-black uppercase tracking-widest px-3 py-2 transition-colors flex items-center gap-2 h-full ${
                toolsOpen ? 'bg-[#ccff00] text-slate-950' : 'text-white hover:bg-slate-900'
              }`}
            >
              Ferramentas
              <motion.span animate={{ rotate: toolsOpen ? 180 : 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M2 4l3 3 3-3" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  id="tools-dropdown"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full left-0 w-[450px] bg-white border-4 border-slate-950 shadow-[8px_8px_0px_#ccff00] p-4 z-50 grid grid-cols-2 gap-2"
                >
                  {tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/ferramentas/${tool.slug}`}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 p-2 hover:bg-[#ccff00] border-2 border-transparent hover:border-slate-950 transition-all group"
                    >
                      <div className="text-slate-950 opacity-70 group-hover:opacity-100">
                        {getToolIcon(tool.icon, 18)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-950">{tool.name}</span>
                        <span className="text-[8px] font-mono text-slate-500 leading-tight line-clamp-1">{tool.description}</span>
                      </div>
                    </Link>
                  ))}
                  <div className="col-span-2 border-t-2 border-slate-100 mt-2 pt-2">
                    <Link 
                      href="/" 
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 flex items-center justify-center gap-2"
                      onClick={() => setToolsOpen(false)}
                    >
                      Ver todas as ferramentas
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 2l3 3-3 3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/tutoriais"
            className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-2 transition-colors"
          >
            Tutoriais
          </Link>

          <Link
            href="/privacidade"
            className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-2 transition-colors"
          >
            Privacidade
          </Link>
        </nav>

        <button
          className="md:hidden text-white border-2 border-white p-1.5 hover:bg-[#ccff00] hover:text-slate-950 hover:border-slate-950 transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            {mobileOpen ? (
              <>
                <line x1="2" y1="2" x2="16" y2="16" />
                <line x1="16" y1="2" x2="2" y2="16" />
              </>
            ) : (
              <>
                <line x1="2" y1="4" x2="16" y2="4" />
                <line x1="2" y1="9" x2="16" y2="9" />
                <line x1="2" y1="14" x2="16" y2="14" />
              </>
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-72 bg-slate-950 border-l-4 border-[#ccff00] z-40 flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-4 transition-colors border-b border-slate-800 flex items-center justify-between"
              >
                Ferramentas
                <motion.span animate={{ rotate: mobileToolsOpen ? 180 : 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5l3 3 3-3" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {mobileToolsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex flex-col pl-4 border-l-2 border-slate-800 ml-2"
                  >
                    {tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/ferramentas/${tool.slug}`}
                        onClick={() => {
                          setMobileOpen(false)
                          setMobileToolsOpen(false)
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#ccff00] py-3 border-b border-slate-900 flex items-center gap-2"
                      >
                        {getToolIcon(tool.icon, 14)}
                        {tool.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href="/tutoriais"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-4 transition-colors border-b border-slate-800"
              >
                Tutoriais
              </Link>

              <Link
                href="/privacidade"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-4 transition-colors border-b border-slate-800"
              >
                Privacidade
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">Um projeto</span>
              <a 
                href="https://unificando.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-slate-950 w-full flex items-center justify-center py-2 border-2 border-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] transition-colors shadow-[4px_4px_0px_#ccff00]"
              >
                Unificando.com.br
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
