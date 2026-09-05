import { type NextRequest } from 'next/server'
import { pdfToMarkdown } from '@/lib/pdf/to-markdown'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { buffer, fileName } = await parseSinglePdfUpload(req)

    const result = await pdfToMarkdown(buffer)
    return streamResponse(result, buildOutputFilename(fileName, 'md'), 'text/markdown; charset=utf-8')
  } catch (err) {
    return errorResponse(err, req)
  }
}
