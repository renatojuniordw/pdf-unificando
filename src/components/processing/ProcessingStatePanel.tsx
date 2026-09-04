import type { ReactNode } from "react";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { StateBanner } from "@/components/shared/StateBanner";
import type { ProcessingStatus as ProcessingStatusType } from "@/types/pdf";

interface ProcessingStatePanelProps {
  status: ProcessingStatusType;
  secondsLeft: number;
  progress: number;
  onRetry: () => void;
  error: string | null;
  onReset: () => void;
  /** Classe aplicada ao wrapper de cada estado (ex.: centralizar largura). */
  className?: string;
  /** Substitui o StateBanner padrão do estado de erro (para UIs customizadas). */
  renderError?: (props: { error: string | null; onReset: () => void }) => ReactNode;
}

/**
 * Renderiza os estados intermediários de processamento compartilhados por
 * todas as ferramentas: uploading/processing, rate_limited e error.
 */
export function ProcessingStatePanel({
  status,
  secondsLeft,
  progress,
  onRetry,
  error,
  onReset,
  className,
  renderError,
}: ProcessingStatePanelProps) {
  if (status === "uploading" || status === "processing") {
    return (
      <div className={className}>
        <ProcessingStatus status={status} />
      </div>
    );
  }

  if (status === "rate_limited") {
    return (
      <div className={className}>
        <RetryCountdown secondsLeft={secondsLeft} progress={progress} onRetry={onRetry} />
      </div>
    );
  }

  if (status === "error") {
    if (renderError) {
      return <>{renderError({ error, onReset })}</>;
    }
    return (
      <div className={className}>
        <StateBanner
          tone="error"
          title="ERRO"
          message={error ?? "Falha ao processar o arquivo."}
          actionLabel="Tentar novamente"
          onAction={onReset}
        />
      </div>
    );
  }

  return null;
}