import { type NextRequest } from 'next/server'
import { redactPdf, type RedactRegion } from '@/lib/pdf/redact'
import { validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, buildOutputFilename, errorResponse, parseSinglePdfUpload, requireFormField, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)

    const regionsRaw = requireFormField(formData, 'regions', 'Nenhuma área de redação informada.', 'missing_regions')

    let regions: RedactRegion[]
    try {
      regions = JSON.parse(regionsRaw)
    } catch {
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'Formato de regiões inválido.', { field: 'regions', reason: 'invalid_json' })
    }

    if (!Array.isArray(regions) || regions.length === 0) {
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'Nenhuma área de redação informada.', { field: 'regions', reason: 'missing_regions' })
    }

    if (
      regions.some(
        (region) =>
          !region ||
          typeof region !== 'object' ||
          !Number.isInteger((region as RedactRegion).page) ||
          !Number.isFinite((region as RedactRegion).x) ||
          !Number.isFinite((region as RedactRegion).y) ||
          !Number.isFinite((region as RedactRegion).width) ||
          !Number.isFinite((region as RedactRegion).height),
      )
    ) {
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'Formato de regiões inválido.', { field: 'regions', reason: 'invalid_shape' })
    }

    const resolutionRaw = Number(formData.get('resolution'))
    const resolution = ([72, 144, 216] as const).includes(resolutionRaw as 72 | 144 | 216)
      ? (resolutionRaw as 72 | 144 | 216)
      : 144

    const result = await redactPdf(buffer, regions, resolution)
    return streamResponse(result, buildOutputFilename(fileName, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err, req)
  }
}
