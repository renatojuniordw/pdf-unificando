import { type NextRequest } from 'next/server'
import { pdfToTxt } from '@/lib/pdf/to-txt'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { buffer, fileName } = await parseSinglePdfUpload(req)

    const result = await pdfToTxt(buffer)
    return streamResponse(result, buildOutputFilename(fileName, 'txt'), 'text/plain; charset=utf-8')
  } catch (err) {
    return errorResponse(err)
  }
}
