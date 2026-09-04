import { type NextRequest } from 'next/server'
import { mergePdfs } from '@/lib/pdf/merge'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parsePdfUploads, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { buffers, fileNames } = await parsePdfUploads(req, 2)

    const merged = await mergePdfs(buffers)
    return streamResponse(merged, buildOutputFilename(fileNames[0], 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
