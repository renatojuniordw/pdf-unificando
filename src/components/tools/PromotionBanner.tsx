'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function PromotionBanner() {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div 
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25 }}
      className="border-4 border-slate-950 bg-white p-8 shadow-[8px_8px_0px_#ccff00] mt-12 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ccff00] rotate-45 opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        <span className="inline-block bg-[#ccff00] text-slate-950 font-black uppercase tracking-widest text-[9px] px-2 py-0.5 border-2 border-slate-950 mb-4">
          SOLUÇÕES CORPORATIVAS
          </span>
        
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-950 leading-none mb-4">
          PRECISA DE SOFTWARE <br />
          <span className="bg-slate-950 text-white px-2">DE ELITE?</span>
        </h3>
        
        <p className="text-sm font-mono text-slate-600 uppercase tracking-tight mb-6 max-w-lg">
          Esta ferramenta é apenas uma pequena amostra do que a <span className="font-black text-slate-900">Unificando</span> pode construir. 
          Criamos sistemas robustos, automações com IA e designs que convertem.
        </p>

        <div className="flex flex-wrap gap-4">
          <a 
            href="https://unificando.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#ccff00] text-slate-950 border-2 border-slate-950 px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-[4px_4px_0px_#000] motion-reduce:transition-none motion-reduce:hover:bg-[#ccff00] motion-reduce:hover:text-slate-950"
          >
            Conheça Nossos Serviços
          </a>
          <a 
            href="https://unificando.com.br/servicos/ia" 
            target="_blank" 
            rel="noopener noreferrer"
            className="border-2 border-slate-950 px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all motion-reduce:transition-none"
          >
            Atendimento com IA
          </a>
        </div>
      </div>
    </motion.div>
  )
}
