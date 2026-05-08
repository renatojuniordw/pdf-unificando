import { type NextRequest } from 'next/server'
import { pdfToTxt } from '@/lib/pdf/to-txt'
import { validateRateLimit } from '@/lib/queue'
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

    const result = await pdfToTxt(buffer)
    return streamResponse(result, buildOutputFilename(file.name, 'txt'), 'text/plain; charset=utf-8')
  } catch (err) {
    return errorResponse(err)
  }
}
