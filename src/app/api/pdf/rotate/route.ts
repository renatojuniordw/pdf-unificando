import { type NextRequest } from 'next/server'
import { rotatePdf, type RotationDegrees, type RotationScope } from '@/lib/pdf/rotate'
import { validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })
    const fileEntry = formData.get('file')
    if (!isFileEntry(fileEntry)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' })
    const file = fileEntry

    assertMaxFileSize(file)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' })
    const rawDeg = Number(formData.get('degrees') ?? 90)
    const deg: RotationDegrees = rawDeg === 180 || rawDeg === 270 ? rawDeg : 90
    const rawScope = formData.get('scope') as string | null
    const scope: RotationScope = rawScope === 'page' ? 'page' : 'all'
    const rawPage = formData.get('page') ? Number(formData.get('page')) : undefined
    const page = rawPage && Number.isInteger(rawPage) && rawPage > 0 ? rawPage - 1 : undefined

    const result = await rotatePdf(buffer, deg, scope, page)
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
