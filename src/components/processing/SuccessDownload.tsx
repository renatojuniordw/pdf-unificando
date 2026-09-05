import type { ReactNode } from "react";
import { StateBanner } from "@/components/shared/StateBanner";
import { DownloadButton } from "@/components/processing/DownloadButton";

function SuccessCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M4 10l4 4 8-8" />
    </svg>
  );
}

interface SuccessDownloadProps {
  url: string;
  filename: string;
  onDownload: () => void;
  fileSize?: number | null;
  onReset: () => void;
  /** Se presente, exibe um StateBanner de sucesso acima do botão de download. */
  title?: string;
  /** Mensagem do banner. Padrão: tamanho do arquivo em MB ou "Arquivo pronto para download.". */
  message?: string;
  className?: string;
  /** Conteúdo extra exibido entre o banner (se houver) e o botão de download. */
  children?: ReactNode;
}

/**
 * Estado de conclusão compartilhado por todas as ferramentas: banner de
 * sucesso opcional + botão de download + reset.
 */
export function SuccessDownload({
  url,
  filename,
  onDownload,
  fileSize,
  onReset,
  title,
  message,
  className = "flex flex-col gap-6",
  children,
}: SuccessDownloadProps) {
  const defaultMessage = fileSize
    ? `${(fileSize / 1024 / 1024).toFixed(1)}MB`
    : "Arquivo pronto para download.";

  return (
    <div data-testid="success-download" className={className}>
      {title ? (
        <StateBanner
          tone="success"
          title={title}
          message={message ?? defaultMessage}
          icon={<SuccessCheckIcon />}
        />
      ) : null}
      {children}
      <DownloadButton
        url={url}
        filename={filename}
        onDownload={onDownload}
        fileSize={fileSize}
        onReset={onReset}
      />
    </div>
  );
}