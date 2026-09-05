import Link from 'next/link'
import { TutorialDefinition } from '@/config/tutorials'
import { getTool } from '@/config/tools'

interface TutorialsListProps {
  tutorials: TutorialDefinition[]
  query: string
}

export function TutorialsList({ tutorials, query }: TutorialsListProps) {
  const normalizedQuery = query.toLowerCase().trim()
  const filteredTutorials = normalizedQuery
    ? tutorials.filter((tutorial) =>
        tutorial.title.toLowerCase().includes(normalizedQuery) ||
        tutorial.description.toLowerCase().includes(normalizedQuery) ||
        tutorial.searchIntent.toLowerCase().includes(normalizedQuery),
      )
    : tutorials

  return (
    <>
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          {query ? (
            <p className="mb-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Mostrando {filteredTutorials.length} resultados para &quot;{query}&quot;
            </p>
          ) : null}

          {filteredTutorials.length > 0 ? (
            <div className="flex flex-col gap-12">
              {filteredTutorials.map((tutorial) => {
                const tool = getTool(tutorial.targetToolSlug)

                return (
                  <article
                    key={tutorial.slug}
                    data-testid={`tutorial-card-${tutorial.slug}`}
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
                        
                        <Link href={`/tutoriais/${tutorial.slug}`} data-testid={`tutorial-title-link-${tutorial.slug}`}>
                          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-950 mt-6 leading-none hover:text-[#ccff00] transition-colors cursor-pointer decoration-4 underline-offset-4 hover:underline">
                            {tutorial.title}
                          </h2>
                        </Link>

                        <p className="text-sm font-mono font-medium uppercase tracking-widest text-slate-600 mt-6 leading-relaxed max-w-2xl">
                          {tutorial.description}
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 border-t-2 border-slate-100 pt-6">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                            Ferramenta: <span className="text-slate-600 underline">{tool.name}</span>
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                            Dificuldade: <span className="text-slate-600">Iniciante</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 md:mt-0 flex flex-col gap-3 min-w-[200px]">
                        <Link
                          href={`/tutoriais/${tutorial.slug}`}
                          data-testid={`tutorial-read-${tutorial.slug}`}
                          className="bg-[#ccff00] text-slate-950 border-4 border-slate-950 px-6 py-4 text-center font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] transition-transform"
                        >
                          Ler tutorial completo
                        </Link>
                        <Link
                          href={`/ferramentas/${tool.slug}`}
                          data-testid={`tutorial-use-tool-${tool.slug}`}
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
            <div data-testid="tutorials-empty" className="border-4 border-dashed border-slate-200 p-20 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">
                Nenhum tutorial encontrado para sua busca.
              </p>
              <Link
                href="/tutoriais"
                data-testid="tutorials-clear-search"
                className="mt-6 inline-flex text-xs font-black uppercase underline decoration-2 underline-offset-4 hover:text-[#ccff00] transition-colors"
              >
                Limpar pesquisa
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
