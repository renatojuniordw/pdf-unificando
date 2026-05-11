
export function EcosystemSection() {
  return (
    <section className="bg-slate-950 border-y-8 border-[#ccff00] py-24 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 border-8 border-[#ccff00] opacity-10 rotate-45 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-[#ccff00] text-slate-950 font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#fff] mb-6">
              O ECOSSISTEMA
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-8">
              CONSTRUÍDO PELA <br />
              <span className="text-[#ccff00]">UNIFICANDO</span>
            </h2>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest leading-relaxed mb-8 max-w-md">
              Não criamos apenas ferramentas. Construímos o futuro do seu negócio com software de elite. 
              Performance máxima, privacidade total e design que impulsiona resultados.
            </p>
            <a 
              href="https://unificando.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-[#ccff00] text-slate-950 border-4 border-slate-950 shadow-[8px_8px_0px_#fff] px-8 py-5 font-black uppercase tracking-[0.2em] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#fff] transition-all"
            >
              VISITAR SITE OFICIAL
            </a>
          </div>
          
          <div className="border-4 border-[#ccff00] p-8 bg-slate-900 shadow-[12px_12px_0px_#ccff00]">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">O que entregamos?</h3>
            <ul className="space-y-4 list-none">
              {[
                { 
                  title: 'INTELIGÊNCIA ARTIFICIAL', 
                  desc: 'Automações inteligentes que escalam sua produtividade.',
                  link: 'https://unificando.com.br/servicos/ia'
                },
                { 
                  title: 'SOFTWARE SOB MEDIDA', 
                  desc: 'Sistemas robustos e escaláveis para desafios complexos.',
                  link: 'https://unificando.com.br/'
                },
                { 
                  title: 'DESIGN DE ALTA PERFORMANCE', 
                  desc: 'Interfaces que convertem e encantam usuários.',
                  link: 'https://unificando.com.br/'
                },
              ].map((item, i) => (
                <li key={i} className="group border-b border-slate-800 pb-4 last:border-0">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex gap-4">
                    <span className="text-[#ccff00] font-black font-mono group-hover:translate-x-1 transition-transform">0{i + 1}</span>
                    <div>
                      <h4 className="text-white font-black uppercase text-sm tracking-widest group-hover:text-[#ccff00] transition-colors">{item.title}</h4>
                      <p className="text-slate-400 text-xs font-mono uppercase mt-1">{item.desc}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
