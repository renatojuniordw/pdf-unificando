interface DownloadButtonProps {
  url: string
  filename: string
  fileSize?: number | null
  onReset: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DownloadButton({ url, filename, fileSize, onReset }: DownloadButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <a
        href={url}
        download={filename}
        className="bg-[#ccff00] text-slate-950 border-4 border-slate-950 shadow-[8px_8px_0px_#000] px-8 py-5 font-black uppercase tracking-[0.2em] hover:bg-[#b3ff00] hover:-translate-y-1 transition-all inline-block text-center"
      >
        BAIXAR ARQUIVO
      </a>
      {fileSize != null && (
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">{formatBytes(fileSize)}</p>
      )}
      <button
        onClick={onReset}
        className="text-xs font-black uppercase tracking-widest text-slate-950 border-b-2 border-current hover:text-slate-600 transition-colors"
      >
        Processar novo arquivo
      </button>
    </div>
  )
}
