import type { ReactNode } from "react";

interface ToolPageShellProps {
  title: string;
  description: string;
  topTrust?: ReactNode;
  bottomTrust?: ReactNode;
  children: ReactNode;
}

export function ToolPageShell({
  title,
  description,
  topTrust,
  bottomTrust,
  children,
}: ToolPageShellProps) {
  return (
    <>
      <section className="bg-[#ccff00] border-b-4 border-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-slate-950 text-[#ccff00] font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000] mb-4">
            FERRAMENTA GRATUITA
          </span>
          <h1 data-testid="tool-page-title" className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] text-slate-950">
            {title}
          </h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-700 mt-4 max-w-xl">
            {description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {topTrust ? (
          <div className="max-w-2xl mx-auto px-6 pb-12">{topTrust}</div>
        ) : null}

        {children}
      </div>

      {bottomTrust ? (
        <div className="max-w-2xl mx-auto px-6 pb-12">{bottomTrust}</div>
      ) : null}
    </>
  );
}
