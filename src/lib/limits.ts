/**
 * Limites de upload compartilhados entre cliente e servidor.
 *
 * Mantido em módulo próprio (sem imports de servidor) para poder ser usado
 * tanto em client components quanto em route handlers e testes.
 */

export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE ?? 52_428_800) // 50MB por arquivo
export const MAX_UPLOAD_FILES = Number(process.env.MAX_UPLOAD_FILES ?? 20)

/**
 * Total máximo por requisição (soma de todos os arquivos), puramente estático.
 * Posicionado abaixo do `client_max_body_size 55M` do nginx para que a API
 * responda com o envelope JSON de erro antes que o nginx intercepte com 413
 * HTML (55M = 57_671_680 bytes; folga de ~5MB para multipart + headers).
 */
export const MAX_TOTAL_UPLOAD_BYTES = 52_428_800 // 50MB total

export interface UploadBatchCheck {
  ok: boolean
  nextCount: number
  nextTotalSize: number
  exceedsCount: boolean
  exceedsTotal: boolean
}

/**
 * Verifica se adicionar `incoming` à lista atual de arquivos respeita os
 * limites de quantidade e de tamanho total. Função pura (sem File/DOM),
 * testável e reutilizável por qualquer ferramenta multi-arquivo.
 */
export function checkUploadBatch(
  current: readonly { size: number }[],
  incoming: readonly { size: number }[],
  maxFiles: number,
  maxTotalBytes: number,
): UploadBatchCheck {
  const nextCount = current.length + incoming.length
  const nextTotalSize = current.reduce((acc, f) => acc + f.size, 0) +
    incoming.reduce((acc, f) => acc + f.size, 0)

  const exceedsCount = nextCount > maxFiles
  const exceedsTotal = nextTotalSize > maxTotalBytes

  return {
    ok: !exceedsCount && !exceedsTotal,
    nextCount,
    nextTotalSize,
    exceedsCount,
    exceedsTotal,
  }
}