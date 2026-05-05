import { type NextRequest } from 'next/server'
import { pdfToPng, type PngDpi } from '@/lib/pdf/to-png'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return Response.json({ error: 'O arquivo não é um PDF válido.' }, { status: 400 })
    const dpi = (formData.get('dpi') as PngDpi) ?? '150'

    const result = await binaryLimit(() => pdfToPng(buffer, dpi))

    const isZip = result[0] === 0x50 && result[1] === 0x4b
    const [ext, mime] = isZip
      ? ['zip', 'application/zip']
      : ['png', 'image/png']

    return streamResponse(result, buildOutputFilename(file.name, ext), mime)
  } catch (err) {
    return errorResponse(err)
  }
}
