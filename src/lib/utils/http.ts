import { NextResponse } from 'next/server'
import {
  defaultApiErrorMessage,
  inferCodeFromStatus,
  type ApiErrorCode,
  type ApiErrorDetails,
} from './api-error'
import { logError } from './logger'

export const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE ?? 52_428_800) // 50MB
export const MAX_UPLOAD_FILES = Number(process.env.MAX_UPLOAD_FILES ?? 20)

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

export async function readFormFile(req: Request): Promise<Buffer> {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    throw createApiError(400, 'VALIDATION_ERROR', 'Nenhum arquivo enviado.', {
      field: 'file',
      reason: 'missing_file',
    })
  }

  assertMaxFileSize(file as File)
  const bytes = await (file as File).arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Validação básica de PDF se a extensão for pdf
  if (file.name.toLowerCase().endsWith('.pdf') && !isPdf(buffer)) {
    throw createApiError(400, 'VALIDATION_ERROR', 'O arquivo não parece ser um PDF válido.', {
      field: 'file',
      reason: 'invalid_pdf',
    })
  }

  return buffer
}

export async function readFormFiles(req: Request): Promise<Buffer[]> {
  const formData = await req.formData()
  const files = formData.getAll('file') as File[]

  if (!files.length) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Nenhum arquivo enviado.', {
      field: 'file',
      reason: 'missing_file',
    })
  }

  return Promise.all(
    files.map(async (f) => {
      assertMaxFileSize(f)
      const bytes = await f.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const name = f.name.toLowerCase()
      if (name.endsWith('.pdf') && !isPdf(buffer)) {
        throw createApiError(400, 'VALIDATION_ERROR', `O arquivo "${f.name}" não é um PDF válido.`, {
          field: 'file',
          reason: 'invalid_pdf',
          fileName: f.name,
        })
      }
      if ((name.endsWith('.jpg') || name.endsWith('.jpeg')) && !isJpg(buffer)) {
        throw createApiError(400, 'VALIDATION_ERROR', `O arquivo "${f.name}" não é uma imagem JPG válida.`, {
          field: 'file',
          reason: 'invalid_jpg',
          fileName: f.name,
        })
      }
      if (name.endsWith('.png') && !isPng(buffer)) {
        throw createApiError(400, 'VALIDATION_ERROR', `O arquivo "${f.name}" não é uma imagem PNG válida.`, {
          field: 'file',
          reason: 'invalid_png',
          fileName: f.name,
        })
      }

      return buffer
    }),
  )
}

export function errorResponse(err: unknown): NextResponse {
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

  if (status >= 500) {
    logError('API Error', err, { status, code })
  }

  return apiErrorResponse(status, code, message, e?.details, retryable, e?.headers)
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
