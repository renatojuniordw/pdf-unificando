import { type NextRequest } from 'next/server'
import { protectPdf } from '@/lib/pdf/protect'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })

    const fileEntry = formData.get('file')
    if (!isFileEntry(fileEntry)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' })
    const file = fileEntry

    const password = (formData.get('password') as string | null)?.trim() ?? ''
    if (!password) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Senha não informada.', { field: 'password', reason: 'missing_password' })
    if (password.length > 128) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Senha muito longa.', { field: 'password', reason: 'too_long', maxLength: 128 })

    assertMaxFileSize(file)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' })

    const result = await binaryLimit(() => protectPdf(buffer, { password }))

    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
