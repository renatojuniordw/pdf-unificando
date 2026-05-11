import { type NextRequest } from 'next/server'
import { mergePdfs } from '@/lib/pdf/merge'
import { validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileCount, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })
    const files = formData.getAll('file').filter(isFileEntry)

    if (files.length < 2) {
      return apiErrorResponse(400, 'VALIDATION_ERROR', 'Envie pelo menos 2 arquivos.', { field: 'file', reason: 'minimum_files', min: 2 })
    }
    assertMaxFileCount(files.length)

    const buffers = await Promise.all(
      files.map(async f => {
        assertMaxFileSize(f)
        const buf = Buffer.from(await f.arrayBuffer())
        if (!isPdf(buf)) {
          throw Object.assign(new Error(`"${f.name}" não é um PDF válido.`), {
            status: 400,
            code: 'VALIDATION_ERROR',
            details: { field: 'file', reason: 'invalid_pdf', fileName: f.name },
          })
        }
        return buf
      })
    )

    const merged = await mergePdfs(buffers)
    return streamResponse(merged, buildOutputFilename(files[0].name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
