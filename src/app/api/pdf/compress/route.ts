import { type NextRequest } from 'next/server'
import { compressPdf, type CompressionQuality } from '@/lib/pdf/compress'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'
import { logInfo } from '@/lib/utils/logger'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    const rawQuality = formData.get('quality')?.toString()
    const quality = (rawQuality || 'medium') as CompressionQuality

    logInfo('API Compress', 'Iniciando compressão', {
      fileName,
      bytes: buffer.byteLength,
      quality,
    })

    const { buffer: compressed, originalSize, compressedSize } =
      await binaryLimit(() => compressPdf(buffer, quality))

    logInfo('API Compress', 'Compressão concluída', {
      fileName,
      originalSize,
      compressedSize,
    })

    const res = streamResponse(compressed, buildOutputFilename(fileName, 'pdf'), 'application/pdf')

    res.headers.set('X-Original-Size', String(originalSize))
    res.headers.set('X-Compressed-Size', String(compressedSize))
    return res
  } catch (err) {
    return errorResponse(err)
  }
}
