'use client'

import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { tools } from '@/config/tools'
import { getToolIcon } from '../tools/ToolIcons'
import { useClickOutside } from '@/hooks/useClickOutside'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toolsButtonRef = useRef<HTMLButtonElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const closeTools = useCallback(() => {
    setToolsOpen(false)
    toolsButtonRef.current?.focus()
  }, [])
  useClickOutside(dropdownRef, closeTools)

  useEffect(() => {
    if (!mobileOpen) return
    const focusable = mobileMenuRef.current?.querySelector<HTMLElement>(
      'a,button,[tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()
  }, [mobileOpen])

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false)
    setMobileToolsOpen(false)
    mobileButtonRef.current?.focus()
  }, [])

  const trapMobileTab = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return

    const focusables = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
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

        <nav className="hidden md:flex items-center gap-1 h-full" aria-label="Principal">
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
            ref={dropdownRef}
          >
              <button
                ref={toolsButtonRef}
                onClick={() => setToolsOpen(!toolsOpen)}
                aria-expanded={toolsOpen}
                aria-controls="tools-dropdown"
                aria-haspopup="true"
                type="button"
                className={`text-xs font-black uppercase tracking-widest px-3 py-2 transition-colors flex items-center gap-2 h-full ${
                  toolsOpen ? 'bg-[#ccff00] text-slate-950' : 'text-white hover:bg-slate-900'
                }`}
            >
              Ferramentas
              <span className={`inline-flex transition-transform duration-150 ${toolsOpen ? 'rotate-180' : 'rotate-0'}`}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M2 4l3 3 3-3" />
                </svg>
              </span>
            </button>

            <div
              id="tools-dropdown"
              hidden={!toolsOpen}
              className={`absolute top-full left-0 w-[450px] bg-white border-4 border-slate-950 shadow-[8px_8px_0px_#ccff00] p-4 z-50 grid grid-cols-2 gap-2 transition-all duration-150 ${
                toolsOpen ? 'visible opacity-100 translate-y-0 pointer-events-auto' : 'invisible opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <ul className="contents">
                {tools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/ferramentas/${tool.slug}`}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 p-2 hover:bg-[#ccff00] border-2 border-transparent hover:border-slate-950 transition-all group"
                    >
                      <div className="text-slate-950 opacity-70 group-hover:opacity-100">
                        {getToolIcon(tool.icon, 18)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-950">{tool.name}</span>
                        <span className="text-[8px] font-mono text-slate-600 leading-tight line-clamp-1">{tool.description}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
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
            </div>
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
          ref={mobileButtonRef}
          className="md:hidden text-white border-2 border-white p-1.5 hover:bg-[#ccff00] hover:text-slate-950 hover:border-slate-950 transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          type="button"
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

      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        hidden={!mobileOpen}
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-72 bg-slate-950 border-l-4 border-[#ccff00] z-40 flex flex-col p-6 overflow-y-auto transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu móvel"
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeMobileMenu()
          trapMobileTab(e)
        }}
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
            type="button"
            className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-4 transition-colors border-b border-slate-800 flex items-center justify-between"
            aria-expanded={mobileToolsOpen}
            aria-controls="mobile-tools-submenu"
          >
            Ferramentas
            <span className={`inline-flex transition-transform duration-150 ${mobileToolsOpen ? 'rotate-180' : 'rotate-0'}`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5l3 3 3-3" />
              </svg>
            </span>
          </button>

          <div
            id="mobile-tools-submenu"
            className={`overflow-hidden flex flex-col pl-4 border-l-2 border-slate-800 ml-2 transition-all duration-200 ${
              mobileToolsOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            }`}
          >
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/ferramentas/${tool.slug}`}
                onClick={closeMobileMenu}
                className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-[#ccff00] py-3 border-b border-slate-900 flex items-center gap-2"
              >
                {getToolIcon(tool.icon, 14)}
                {tool.name}
              </Link>
            ))}
          </div>

          <Link
            href="/tutoriais"
            onClick={closeMobileMenu}
            className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-4 transition-colors border-b border-slate-800"
          >
            Tutoriais
          </Link>

          <Link
            href="/privacidade"
            onClick={closeMobileMenu}
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
      </div>
    </header>
  )
}
