import { type NextRequest } from 'next/server'
import { extractPdfPages } from '@/lib/pdf/extract-pages'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, requireFormField, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    const pages = requireFormField(formData, 'range', 'Informe o intervalo de páginas.', 'missing_range')

    const result = await extractPdfPages(buffer, pages)
    return streamResponse(result, buildOutputFilename(fileName, 'zip'), 'application/zip')
  } catch (err) {
    return errorResponse(err)
  }
}
