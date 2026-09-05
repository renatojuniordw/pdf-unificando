"use client";

import Link from "next/link";
import { StateBanner } from "@/components/shared/StateBanner";

interface ErrorScreenProps {
  title: string
  message: string
  onRetry: () => void
}

export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <div data-testid="error-screen" className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <StateBanner
          tone="error"
          title={title}
          message={
            <>
              <span className="block">A página encontrou um problema recuperável.</span>
              <span className="block mt-1">{message}</span>
            </>
          }
          actionLabel="Tentar novamente"
          onAction={onRetry}
        />
        <Link
          href="/"
          data-testid="error-home-link"
          className="mt-3 inline-flex bg-white text-slate-950 border-4 border-slate-950 px-5 py-3 font-black uppercase tracking-widest text-xs text-center hover:bg-slate-100 transition-colors"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}
