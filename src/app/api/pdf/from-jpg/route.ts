import { type NextRequest } from 'next/server'
import { jpgToPdf, type PageOrientation } from '@/lib/pdf/from-jpg'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseImageUploads, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffers, fileNames } = await parseImageUploads(req)
    const orientation = (formData.get('orientation') as PageOrientation) ?? 'portrait'

    const result = await jpgToPdf(buffers, orientation)
    return streamResponse(result, buildOutputFilename(fileNames[0], 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err, req)
  }
}
