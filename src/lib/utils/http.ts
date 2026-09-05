import { NextResponse } from 'next/server'
import {
  defaultApiErrorMessage,
  inferCodeFromStatus,
  type ApiErrorCode,
  type ApiErrorDetails,
} from './api-error'
import { logError } from './logger'
import {
  MAX_FILE_SIZE,
  MAX_TOTAL_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
} from '../limits'

export { MAX_FILE_SIZE, MAX_TOTAL_UPLOAD_BYTES, MAX_UPLOAD_FILES } from '../limits'

type UploadLike = Pick<File, 'name' | 'size'>

export function isFileEntry(value: FormDataEntryValue | null): value is File {
  return value instanceof File
}

export function createApiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorDetails,
  retryable?: boolean,
  headers?: Record<string, string>,
): Error & {
  status: number
  code: ApiErrorCode
  details?: ApiErrorDetails
  retryable?: boolean
  headers?: Record<string, string>
} {
  return Object.assign(new Error(message), {
    status,
    code,
    details,
    retryable,
    headers,
  })
}

export function apiErrorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorDetails,
  retryable = false,
  headers?: Record<string, string>,
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
        retryable,
      },
    },
    { status },
  )

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value)
    }
  }

  return response
}

export function assertMaxFileSize(file: UploadLike, maxSize = MAX_FILE_SIZE): void {
  if (file.size > maxSize) {
    throw createApiError(
      413,
      'VALIDATION_ERROR',
      `Arquivo "${file.name}" muito grande. Limite: ${Math.round(maxSize / 1024 / 1024)}MB.`,
      { field: 'file', reason: 'file_too_large', maxSize, fileName: file.name },
    )
  }
}

export function assertMaxTotalSize(
  files: readonly { size: number }[],
  maxTotal = MAX_TOTAL_UPLOAD_BYTES,
): void {
  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  if (totalSize > maxTotal) {
    throw createApiError(
      413,
      'VALIDATION_ERROR',
      `Tamanho total dos arquivos excede o limite. Limite: ${Math.round(maxTotal / 1024 / 1024)}MB.`,
      { field: 'file', reason: 'total_too_large', maxTotalSize: maxTotal, totalSize },
    )
  }
}

export function assertMaxFileCount(count: number, maxCount = MAX_UPLOAD_FILES): void {
  if (count > maxCount) {
    throw createApiError(
      413,
      'VALIDATION_ERROR',
      `Muitos arquivos enviados. Limite: ${maxCount}.`,
      { field: 'file', reason: 'too_many_files', maxCount, count },
    )
  }
}

export function errorResponse(err: unknown, req?: Request): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'
  const e = err as {
    message?: string
    status?: number
    code?: ApiErrorCode
    details?: ApiErrorDetails
    retryable?: boolean
    headers?: Record<string, string>
  }
  const status = e?.status ?? 500
  const code = e?.code ?? inferCodeFromStatus(status)
  const message =
    status === 500 && isProd
      ? defaultApiErrorMessage('INTERNAL_ERROR')
      : (e?.message ?? defaultApiErrorMessage(code))
  const retryable = e?.retryable ?? (status === 429 || status === 408 || status >= 500)
  const requestId = req?.headers.get('x-request-id') ?? undefined

  if (status >= 500) {
    logError('API Error', err, { status, code, requestId })
  }

  const headers = {
    ...(requestId ? { 'X-Request-Id': requestId } : {}),
    ...(e?.headers ?? {}),
  }

  return apiErrorResponse(status, code, message, e?.details, retryable, headers)
}

export function buildOutputFilename(originalName: string, outputExt: string): string {
  const base = originalName
    .replace(/\.[^.]+$/, '') // Remove extensão
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9]/g, '_') // Troca tudo que não é alfanumérico por sublinhado
    .replace(/_{2,}/g, '_') // Remove sublinhados duplicados
    .substring(0, 100) // Limita tamanho

  return `${base}_unificando.${outputExt}`
}

export function streamResponse(buffer: Buffer, filename: string, mimeType: string): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

export function isPdf(buffer: Buffer): boolean {
  // PDF magic bytes: %PDF- (25 50 44 46 2d)
  return (
    buffer.length > 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  )
}

export function isJpg(buffer: Buffer): boolean {
  // JPG magic bytes: FF D8 FF
  return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
}

export function isPng(buffer: Buffer): boolean {
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  return (
    buffer.length > 7 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  )
}

export function validateHoneypot(formData: FormData): boolean {
  const hp = formData.get('_hp')
  return hp === null || hp === ''
}

/** Lê o FormData e rejeita requisições que dispararam o honeypot. */
export async function parseFormData(req: Request): Promise<FormData> {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    // Body vazio, malformado ou multipart truncado (ex.: acima do limite do proxy)
    throw createApiError(400, 'VALIDATION_ERROR', 'Corpo da requisição inválido.', {
      field: 'body',
      reason: 'invalid_body',
    })
  }
  if (!validateHoneypot(formData)) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Acesso negado.', {
      field: '_hp',
      reason: 'honeypot_triggered',
    })
  }
  return formData
}

/**
 * Parse de upload de PDF único (campo `file`): honeypot, presença, tamanho e
 * magic bytes. Retorna o FormData (para ler parâmetros adicionais), o buffer
 * e o nome original do arquivo. Lança ApiError em cada falha.
 */
export async function parseSinglePdfUpload(
  req: Request,
): Promise<{ formData: FormData; buffer: Buffer; fileName: string }> {
  const formData = await parseFormData(req)
  const fileEntry = formData.get('file')
  if (!isFileEntry(fileEntry)) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', {
      field: 'file',
      reason: 'missing_file',
    })
  }

  assertMaxFileSize(fileEntry)
  const buffer = Buffer.from(await fileEntry.arrayBuffer())
  if (!isPdf(buffer)) {
    throw createApiError(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', {
      field: 'file',
      reason: 'invalid_pdf',
    })
  }

  return { formData, buffer, fileName: fileEntry.name }
}

/** Parse de múltiplos uploads de PDF (campo `file` repetido), validando PDF. */
export async function parsePdfUploads(
  req: Request,
  min = 1,
  maxTotalSize = MAX_TOTAL_UPLOAD_BYTES,
): Promise<{ formData: FormData; buffers: Buffer[]; fileNames: string[] }> {
  const formData = await parseFormData(req)
  const files = formData.getAll('file').filter(isFileEntry)

  if (files.length < min) {
    throw createApiError(
      400,
      'VALIDATION_ERROR',
      min > 1 ? `Envie pelo menos ${min} arquivos.` : 'Nenhum arquivo enviado.',
      { field: 'file', reason: min > 1 ? 'minimum_files' : 'missing_file', ...(min > 1 ? { min } : {}) },
    )
  }
  assertMaxFileCount(files.length)
  assertMaxTotalSize(files, maxTotalSize)

  const buffers = await Promise.all(
    files.map(async (f) => {
      assertMaxFileSize(f)
      const buf = Buffer.from(await f.arrayBuffer())
      if (!isPdf(buf)) {
        throw createApiError(400, 'VALIDATION_ERROR', `"${f.name}" não é um PDF válido.`, {
          field: 'file',
          reason: 'invalid_pdf',
          fileName: f.name,
        })
      }
      return buf
    }),
  )

  return { formData, buffers, fileNames: files.map((f) => f.name) }
}

/** Parse de múltiplos uploads de imagem (campo `file` repetido), validando JPG/PNG. */
export async function parseImageUploads(
  req: Request,
  maxTotalSize = MAX_TOTAL_UPLOAD_BYTES,
): Promise<{ formData: FormData; buffers: Buffer[]; fileNames: string[] }> {
  const formData = await parseFormData(req)
  const files = formData.getAll('file').filter(isFileEntry)

  if (!files.length) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Nenhuma imagem enviada.', {
      field: 'file',
      reason: 'missing_file',
    })
  }
  assertMaxFileCount(files.length)
  assertMaxTotalSize(files, maxTotalSize)

  const buffers = await Promise.all(
    files.map(async (f) => {
      assertMaxFileSize(f)
      const buf = Buffer.from(await f.arrayBuffer())
      if (!isJpg(buf) && !isPng(buf)) {
        throw createApiError(400, 'VALIDATION_ERROR', `"${f.name}" não é uma imagem JPG ou PNG válida.`, {
          field: 'file',
          reason: 'invalid_image',
          fileName: f.name,
        })
      }
      return buf
    }),
  )

  return { formData, buffers, fileNames: files.map((f) => f.name) }
}

/**
 * Lê um campo obrigatório do FormData e lança ApiError se ausente ou vazio.
 * Opcionalmente faz trim e valida comprimento máximo.
 */
export function requireFormField(
  formData: FormData,
  name: string,
  message: string,
  reason: string,
  opts: { trim?: boolean; maxLength?: number; maxMessage?: string } = {},
): string {
  const raw = formData.get(name)
  const value = typeof raw === 'string' ? (opts.trim ? raw.trim() : raw) : ''
  if (!value) {
    throw createApiError(400, 'VALIDATION_ERROR', message, { field: name, reason })
  }
  if (opts.maxLength && value.length > opts.maxLength) {
    throw createApiError(
      400,
      'VALIDATION_ERROR',
      opts.maxMessage ?? `Valor muito longo. Máximo: ${opts.maxLength} caracteres.`,
      { field: name, reason: 'too_long', maxLength: opts.maxLength },
    )
  }
  return value
}
