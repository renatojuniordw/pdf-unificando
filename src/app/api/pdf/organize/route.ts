import { type NextRequest } from 'next/server'
import { organizePdf } from '@/lib/pdf/organize'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, requireFormField, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    const order = requireFormField(formData, 'order', 'Informe a ordem das páginas.', 'missing_order')

    const result = await organizePdf(buffer, order)
    return streamResponse(result, buildOutputFilename(fileName, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
