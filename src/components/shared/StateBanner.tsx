import type { ReactNode } from "react";
import { BrutalistCard } from "@/components/layout/BrutalistCard";

type StateBannerTone = "error" | "success" | "info";

interface StateBannerProps {
  tone: StateBannerTone;
  title: string;
  message: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const TONE_STYLES: Record<StateBannerTone, string> = {
  error: "bg-[#b91c1c] text-white border-slate-950 shadow-[4px_4px_0px_#000]",
  success: "bg-[#00ff66] text-slate-950 border-slate-950 shadow-[4px_4px_0px_#000]",
  info: "bg-slate-950 text-[#ccff00] border-[#ccff00] shadow-[4px_4px_0px_#ccff00]",
};

export function StateBanner({
  tone,
  title,
  message,
  actionLabel,
  onAction,
  icon,
  className = "",
}: StateBannerProps) {
  const ariaRole = tone === "error" ? "alert" : "status";
  const ariaLive = tone === "error" ? "assertive" : "polite";

  return (
    <BrutalistCard
      role={ariaRole}
      aria-live={ariaLive}
      aria-atomic="true"
      className={`p-4 md:p-6 flex items-center gap-4 ${TONE_STYLES[tone]} ${className}`}
    >
      {icon ? <div className="shrink-0">{icon}</div> : null}
      <div>
        <p className="font-black uppercase tracking-widest text-sm">{title}</p>
        <p className="font-mono text-xs uppercase mt-1 leading-relaxed">
          {message}
        </p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="ml-auto border-2 border-current px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
        >
          {actionLabel}
        </button>
      ) : null}
    </BrutalistCard>
  );
}
