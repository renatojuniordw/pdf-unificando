import { type NextRequest } from 'next/server'
import { jpgToPdf, type PageOrientation } from '@/lib/pdf/from-jpg'
import { validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileCount, assertMaxFileSize, buildOutputFilename, errorResponse, isFileEntry, isJpg, isPng, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })
    const files = formData.getAll('file').filter(isFileEntry)
    if (!files.length) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Nenhuma imagem enviada.', { field: 'file', reason: 'missing_file' })
    assertMaxFileCount(files.length)

    const buffers = await Promise.all(
      files.map(async f => {
        assertMaxFileSize(f)
        const buf = Buffer.from(await f.arrayBuffer())
        if (!isJpg(buf) && !isPng(buf)) {
          throw Object.assign(new Error(`"${f.name}" não é uma imagem JPG ou PNG válida.`), {
            status: 400,
            code: 'VALIDATION_ERROR',
            details: { field: 'file', reason: 'invalid_image', fileName: f.name },
          })
        }
        return buf
      })
    )
    const orientation = (formData.get('orientation') as PageOrientation) ?? 'portrait'

    const result = await jpgToPdf(buffers, orientation)
    return streamResponse(result, buildOutputFilename(files[0].name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
