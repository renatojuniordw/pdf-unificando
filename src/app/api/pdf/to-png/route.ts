import { type NextRequest } from 'next/server'
import { pdfToPng, type PngDpi } from '@/lib/pdf/to-png'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    const rawDpi = formData.get('dpi') as string | null
    const dpi: PngDpi = rawDpi === '72' || rawDpi === '300' ? rawDpi : '150'

    const result = await binaryLimit(() => pdfToPng(buffer, dpi))

    const isZip = result[0] === 0x50 && result[1] === 0x4b
    const [ext, mime] = isZip
      ? ['zip', 'application/zip']
      : ['png', 'image/png']

    return streamResponse(result, buildOutputFilename(fileName, ext), mime)
  } catch (err) {
    return errorResponse(err, req)
  }
}
