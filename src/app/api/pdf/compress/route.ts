import { type NextRequest } from 'next/server'
import { compressPdf, type CompressionQuality } from '@/lib/pdf/compress'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'
import { logInfo } from '@/lib/utils/logger'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })
    const fileEntry = formData.get('file')
    if (!isFileEntry(fileEntry)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' })
    const file = fileEntry

    assertMaxFileSize(file)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' })
    const rawQuality = formData.get('quality')?.toString()
    const quality = (rawQuality || 'medium') as CompressionQuality

    logInfo('API Compress', 'Iniciando compressão', {
      fileName: file.name,
      bytes: buffer.byteLength,
      quality,
    })

    const { buffer: compressed, originalSize, compressedSize } =
      await binaryLimit(() => compressPdf(buffer, quality))

    logInfo('API Compress', 'Compressão concluída', {
      fileName: file.name,
      originalSize,
      compressedSize,
    })

    const res = streamResponse(compressed, buildOutputFilename(file.name, 'pdf'), 'application/pdf')

    res.headers.set('X-Original-Size', String(originalSize))
    res.headers.set('X-Compressed-Size', String(compressedSize))
    return res
  } catch (err) {
    return errorResponse(err)
  }
}
