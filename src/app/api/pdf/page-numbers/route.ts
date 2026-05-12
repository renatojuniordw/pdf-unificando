import { type NextRequest } from 'next/server'
import { addPageNumbers, type PageNumberAlignment, type PageNumberPlacement } from '@/lib/pdf/page-numbers'
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

    const rawPlacement = formData.get('placement') as string | null
    const placement: PageNumberPlacement = rawPlacement === 'header' ? 'header' : 'footer'

    const rawAlignment = formData.get('alignment') as string | null
    const alignment: PageNumberAlignment =
      rawAlignment === 'left' || rawAlignment === 'center' || rawAlignment === 'right'
        ? rawAlignment
        : 'center'

    const rawStartAt = parseInt((formData.get('startAt') as string | null) ?? '1', 10)
    const startAt = Number.isNaN(rawStartAt) ? 1 : Math.min(9999, Math.max(1, rawStartAt))

    assertMaxFileSize(file)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' })

    const result = await addPageNumbers(buffer, { placement, alignment, startAt })
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
