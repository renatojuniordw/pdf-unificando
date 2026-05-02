interface RetryCountdownProps {
  secondsLeft: number
  progress: number
  onRetry: () => void
}

export function RetryCountdown({ secondsLeft, progress, onRetry }: RetryCountdownProps) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const isDone = secondsLeft === 0

  return (
    <div className="bg-slate-950 border-4 border-[#ccff00] shadow-[8px_8px_0px_#ccff00] p-8 flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#ccff00] text-slate-950 border-2 border-slate-950 p-2 shadow-[2px_2px_0px_#000]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <path d="M10 4v6l4 2" />
            <circle cx="10" cy="10" r="8" />
          </svg>
        </div>
        <h3 className="font-black uppercase tracking-tighter text-[#ccff00] text-2xl">SERVIDOR OCUPADO</h3>
      </div>

      <p className="text-slate-400 font-mono text-xs uppercase tracking-widest text-center">
        Muitas requisições simultâneas. Aguarde para tentar novamente.
      </p>

      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} stroke="#1e293b" strokeWidth="6" fill="none" />
        <circle
          cx="48" cy="48" r={radius}
          stroke={isDone ? '#00ff66' : '#ccff00'}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
        <text x="48" y="48" textAnchor="middle" dominantBaseline="central" fill={isDone ? '#00ff66' : '#ccff00'} className="font-black tabular-nums text-2xl" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '22px' }}>
          {secondsLeft}
        </text>
        <text x="48" y="64" textAnchor="middle" fill="#94a3b8" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          SEG
        </text>
      </svg>

      {isDone && (
        <button
          onClick={onRetry}
          className="bg-[#ccff00] text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] font-black uppercase tracking-[0.2em] px-8 py-4 hover:bg-[#b3ff00] hover:-translate-y-1 transition-all"
        >
          TENTAR NOVAMENTE
        </button>
      )}
    </div>
  )
}
