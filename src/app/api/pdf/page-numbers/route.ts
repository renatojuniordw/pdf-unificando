import { type NextRequest } from 'next/server'
import { addPageNumbers, type PageNumberAlignment, type PageNumberPlacement } from '@/lib/pdf/page-numbers'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'

// Limite de segurança para o número inicial da numeração
const MAX_START_AT = 9999

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)

    const rawPlacement = formData.get('placement') as string | null
    const placement: PageNumberPlacement = rawPlacement === 'header' ? 'header' : 'footer'

    const rawAlignment = formData.get('alignment') as string | null
    const alignment: PageNumberAlignment =
      rawAlignment === 'left' || rawAlignment === 'center' || rawAlignment === 'right'
        ? rawAlignment
        : 'center'

    const rawStartAt = parseInt((formData.get('startAt') as string | null) ?? '1', 10)
    const startAt = Number.isNaN(rawStartAt) ? 1 : Math.min(MAX_START_AT, Math.max(1, rawStartAt))

    const result = await addPageNumbers(buffer, { placement, alignment, startAt })
    return streamResponse(result, buildOutputFilename(fileName, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err, req)
  }
}
