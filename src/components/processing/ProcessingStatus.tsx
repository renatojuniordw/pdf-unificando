interface ProcessingStatusProps {
  status: 'uploading' | 'processing'
}

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  return (
    <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-8 flex flex-col gap-4">
      {status === 'uploading' ? (
        <>
          <div className="w-full h-4 bg-slate-200 animate-pulse border-4 border-slate-950" />
          <div className="w-2/3 h-4 bg-slate-200 animate-pulse border-4 border-slate-950" />
          <p className="font-black uppercase tracking-widest text-sm text-slate-950">ENVIANDO...</p>
        </>
      ) : (
        <>
          <div className="w-full border-2 border-slate-950 h-4 overflow-hidden">
            <div className="h-full bg-slate-950 w-2/3 animate-pulse" />
          </div>
          <p className="font-black uppercase tracking-widest text-sm text-slate-950">PROCESSANDO...</p>
        </>
      )}
    </div>
  )
}
