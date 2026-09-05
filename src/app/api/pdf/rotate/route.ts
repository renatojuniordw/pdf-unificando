import { type NextRequest } from 'next/server'
import { rotatePdf, type RotationDegrees, type RotationScope } from '@/lib/pdf/rotate'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    // Valores inválidos são rejeitados por rotatePdf (400) — sem coerção silenciosa
    const deg = Number(formData.get('degrees') ?? 90) as RotationDegrees
    const rawScope = formData.get('scope') as string | null
    const scope: RotationScope = rawScope === 'page' ? 'page' : 'all'
    const rawPage = formData.get('page') ? Number(formData.get('page')) : undefined
    const page = rawPage && Number.isInteger(rawPage) && rawPage > 0 ? rawPage - 1 : undefined

    const result = await rotatePdf(buffer, deg, scope, page)
    return streamResponse(result, buildOutputFilename(fileName, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err, req)
  }
}
