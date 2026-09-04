import { type NextRequest } from 'next/server'
import { watermarkPdf, type WatermarkColor } from '@/lib/pdf/watermark'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, requireFormField, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    const text = requireFormField(formData, 'text', "Texto da marca d'água não informado.", 'missing_text', {
      trim: true,
      maxLength: 100,
      maxMessage: 'Texto muito longo. Máximo: 100 caracteres.',
    })

    const rawColor = formData.get('color') as string | null
    const color: WatermarkColor =
      rawColor === 'gray' || rawColor === 'black' || rawColor === 'red' ? rawColor : 'gray'

    const rawOpacity = parseFloat(formData.get('opacity') as string ?? '0.3')
    const opacity = isNaN(rawOpacity) ? 0.3 : Math.min(1, Math.max(0.05, rawOpacity))

    const rawFontSize = parseInt(formData.get('fontSize') as string ?? '60', 10)
    const fontSize = isNaN(rawFontSize) ? 60 : Math.min(120, Math.max(20, rawFontSize))

    const result = await watermarkPdf(buffer, { text, opacity, fontSize, color })

    return streamResponse(result, buildOutputFilename(fileName, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
