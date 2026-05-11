export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20" aria-live="polite" aria-busy="true">
      <div className="animate-pulse motion-reduce:animate-none space-y-6">
        <div className="h-4 w-36 bg-slate-200" />
        <div className="h-14 max-w-3xl bg-slate-200" />
        <div className="h-12 max-w-4xl bg-slate-100 border-4 border-slate-950" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 border-4 border-slate-950 bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
