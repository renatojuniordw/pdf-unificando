import { type NextRequest } from 'next/server'
import { extractPdfPages } from '@/lib/pdf/extract-pages'
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

    const pages = (formData.get('range') as string) ?? ''
    if (!pages) {
      return Response.json({ error: 'Informe o intervalo de páginas.' }, { status: 400 })
    }

    const result = await extractPdfPages(buffer, pages)
    return streamResponse(result, buildOutputFilename(file.name, 'zip'), 'application/zip')
  } catch (err) {
    return errorResponse(err)
  }
}
