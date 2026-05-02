'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-16 bg-slate-950 border-b-4 border-[#ccff00] flex items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between w-full">
        <Link href="/" className="group flex items-center gap-3">
          <div className="bg-[#ccff00] p-2 border-2 border-slate-950 shadow-[4px_4px_0px_#fff] group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_#fff] transition-all">
            <span className="font-black text-slate-950 text-sm uppercase tracking-tighter leading-none">PDF</span>
          </div>
          <span className="font-black text-white text-sm uppercase tracking-widest hidden sm:block">Unificando</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/', label: 'Ferramentas' },
            { href: '/privacidade', label: 'Privacidade' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-2 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden text-white border-2 border-white p-1.5 hover:bg-[#ccff00] hover:text-slate-950 hover:border-slate-950 transition-colors"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-slate-950 border-l-4 border-[#ccff00] z-40 flex flex-col p-6 gap-2"
          >
            {[
              { href: '/', label: 'Ferramentas' },
              { href: '/privacidade', label: 'Privacidade' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-xs font-black uppercase tracking-widest text-white hover:bg-[#ccff00] hover:text-slate-950 px-3 py-3 transition-colors border-b border-slate-800"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
