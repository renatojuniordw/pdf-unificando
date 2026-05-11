import { type NextRequest } from 'next/server'
import { watermarkPdf, type WatermarkColor } from '@/lib/pdf/watermark'
import { validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })

    const fileEntry = formData.get('file')
    if (!isFileEntry(fileEntry)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' })
    const file = fileEntry

    const text = (formData.get('text') as string | null)?.trim() ?? ''
    if (!text) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Texto da marca d\'água não informado.', { field: 'text', reason: 'missing_text' })
    if (text.length > 100) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Texto muito longo. Máximo: 100 caracteres.', { field: 'text', reason: 'too_long', maxLength: 100 })

    const rawColor = formData.get('color') as string | null
    const color: WatermarkColor =
      rawColor === 'gray' || rawColor === 'black' || rawColor === 'red' ? rawColor : 'gray'

    const rawOpacity = parseFloat(formData.get('opacity') as string ?? '0.3')
    const opacity = isNaN(rawOpacity) ? 0.3 : Math.min(1, Math.max(0.05, rawOpacity))

    const rawFontSize = parseInt(formData.get('fontSize') as string ?? '60', 10)
    const fontSize = isNaN(rawFontSize) ? 60 : Math.min(120, Math.max(20, rawFontSize))

    assertMaxFileSize(file)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' })

    const result = await watermarkPdf(buffer, { text, opacity, fontSize, color })

    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
