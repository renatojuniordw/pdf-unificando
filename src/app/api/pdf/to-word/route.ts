import { type NextRequest } from 'next/server'
import { pdfToWord } from '@/lib/pdf/to-word'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { buffer, fileName } = await parseSinglePdfUpload(req)
    const result = await binaryLimit(() => pdfToWord(buffer))
    return streamResponse(result, buildOutputFilename(fileName, 'docx'), DOCX_MIME)
  } catch (err) {
    return errorResponse(err)
  }
}
