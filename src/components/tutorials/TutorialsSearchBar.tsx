'use client'

import { useEffect, useState } from 'react'
import { useId } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface TutorialsSearchBarProps {
  initialQuery: string
}

export function TutorialsSearchBar({ initialQuery }: TutorialsSearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const inputId = useId()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalizedValue = value.trim()
      const currentValue = initialQuery.trim()

      if (normalizedValue === currentValue) return

      const params = new URLSearchParams(searchParams.toString())
      if (normalizedValue) {
        params.set('q', normalizedValue)
      } else {
        params.delete('q')
      }

      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [initialQuery, pathname, router, searchParams, value])

  return (
    <section className="bg-white py-12 border-b-4 border-slate-100">
      <div className="max-w-4xl mx-auto px-6">
        <label htmlFor={inputId} className="sr-only">
          Pesquisar tutoriais
        </label>
        <div className="relative group">
          <input
            id={inputId}
            type="text"
            placeholder="PESQUISAR TUTORIAL (EX: JUNTAR, COMPRIMIR...)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-white border-4 border-slate-950 p-6 font-black uppercase text-sm tracking-widest focus:outline-none focus:shadow-[8px_8px_0px_#ccff00] transition-all placeholder:text-slate-400 shadow-[8px_8px_0px_#000]"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={`transition-colors ${value ? 'text-[#ccff00]' : 'text-slate-950'}`}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
