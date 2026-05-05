'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TutorialDefinition } from '@/config/tutorials'
import { getTool } from '@/config/tools'

interface TutorialsListProps {
  tutorials: TutorialDefinition[]
}

export function TutorialsList({ tutorials }: TutorialsListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTutorials = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return tutorials

    return tutorials.filter((t) => 
      t.title.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.searchIntent.toLowerCase().includes(query)
    )
  }, [searchQuery, tutorials])

  return (
    <>
      <section className="bg-white py-12 border-b-4 border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative group">
            <input
              type="text"
              placeholder="PESQUISAR TUTORIAL (EX: JUNTAR, COMPRIMIR...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-4 border-slate-950 p-6 font-black uppercase text-sm tracking-widest focus:outline-none focus:shadow-[8px_8px_0px_#ccff00] transition-all placeholder:text-slate-300 shadow-[8px_8px_0px_#000]"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <svg 
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" 
                className={`transition-colors ${searchQuery ? 'text-[#ccff00]' : 'text-slate-950'}`}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
          {searchQuery && (
            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Mostrando {filteredTutorials.length} resultados para &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          {filteredTutorials.length > 0 ? (
            <div className="flex flex-col gap-12">
              {filteredTutorials.map((tutorial) => {
                const tool = getTool(tutorial.targetToolSlug)

                return (
                  <article
                    key={tutorial.slug}
                    className="group border-4 border-slate-950 bg-white shadow-[12px_12px_0px_#000] p-8 md:p-10 transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[16px_16px_0px_#ccff00]"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-block bg-slate-950 text-[#ccff00] text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-slate-950 shadow-[2px_2px_0px_#ccff00]">
                            {tutorial.searchIntent}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Passo a passo
                          </span>
                        </div>
                        
                        <Link href={`/tutoriais/${tutorial.slug}`}>
                          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-950 mt-6 leading-none hover:text-[#ccff00] transition-colors cursor-pointer decoration-4 underline-offset-4 hover:underline">
                            {tutorial.title}
                          </h2>
                        </Link>

                        <p className="text-sm font-mono font-medium uppercase tracking-widest text-slate-600 mt-6 leading-relaxed max-w-2xl">
                          {tutorial.description}
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 border-t-2 border-slate-100 pt-6">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                            Ferramenta: <span className="text-slate-400 underline">{tool.name}</span>
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                            Dificuldade: <span className="text-slate-400">Iniciante</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 md:mt-0 flex flex-col gap-3 min-w-[200px]">
                        <Link
                          href={`/tutoriais/${tutorial.slug}`}
                          className="bg-[#ccff00] text-slate-950 border-4 border-slate-950 px-6 py-4 text-center font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] transition-transform"
                        >
                          Ler tutorial completo
                        </Link>
                        <Link
                          href={`/ferramentas/${tool.slug}`}
                          className="bg-white text-slate-950 border-4 border-slate-950 px-6 py-4 text-center font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:bg-slate-100 transition-colors"
                        >
                          Usar ferramenta
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="border-4 border-dashed border-slate-200 p-20 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                Nenhum tutorial encontrado para sua busca.
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-xs font-black uppercase underline decoration-2 underline-offset-4 hover:text-[#ccff00] transition-colors"
              >
                Limpar pesquisa
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
