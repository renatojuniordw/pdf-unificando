import { type NextRequest } from 'next/server'
import { organizePdf } from '@/lib/pdf/organize'
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
    const order = formData.get('order') as string
    if (!order) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Informe a ordem das páginas.', { field: 'order', reason: 'missing_order' })

    const result = await organizePdf(buffer, order)
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
