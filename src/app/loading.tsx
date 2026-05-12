export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20" aria-live="polite" aria-busy="true">
      <div className="animate-pulse motion-reduce:animate-none space-y-6">
        <div className="h-4 w-40 bg-slate-200" />
        <div className="h-16 max-w-4xl bg-slate-200" />
        <div className="h-6 max-w-2xl bg-slate-200" />
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-56 border-4 border-slate-950 bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
