import { type NextRequest } from 'next/server'
import { pdfToJpg, type JpgDpi } from '@/lib/pdf/to-jpg'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

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
    const rawDpi = formData.get('dpi') as string | null
    const dpi: JpgDpi = rawDpi === '72' || rawDpi === '300' ? rawDpi : '150'

    const result = await binaryLimit(() => pdfToJpg(buffer, dpi))

    const isZip = result[0] === 0x50 && result[1] === 0x4b
    const [ext, mime] = isZip
      ? ['zip', 'application/zip']
      : ['jpg', 'image/jpeg']

    return streamResponse(result, buildOutputFilename(file.name, ext), mime)
  } catch (err) {
    return errorResponse(err)
  }
}
