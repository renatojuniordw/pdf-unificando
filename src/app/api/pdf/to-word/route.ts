import { type NextRequest } from 'next/server'
import { pdfToWord } from '@/lib/pdf/to-word'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isPdf, streamResponse } from '@/lib/utils/http'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return Response.json({ error: 'O arquivo não é um PDF válido.' }, { status: 400 })
    const result = await binaryLimit(() => pdfToWord(buffer))
    return streamResponse(result, buildOutputFilename(file.name, 'docx'), DOCX_MIME)
  } catch (err) {
    return errorResponse(err)
  }
}
