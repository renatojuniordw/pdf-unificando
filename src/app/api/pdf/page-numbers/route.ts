import { type NextRequest } from 'next/server'
import { addPageNumbers, type PageNumberAlignment, type PageNumberPlacement } from '@/lib/pdf/page-numbers'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })

    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const rawPlacement = formData.get('placement') as string | null
    const placement: PageNumberPlacement = rawPlacement === 'header' ? 'header' : 'footer'

    const rawAlignment = formData.get('alignment') as string | null
    const alignment: PageNumberAlignment =
      rawAlignment === 'left' || rawAlignment === 'center' || rawAlignment === 'right'
        ? rawAlignment
        : 'center'

    const rawStartAt = parseInt((formData.get('startAt') as string | null) ?? '1', 10)
    const startAt = Number.isNaN(rawStartAt) ? 1 : Math.min(9999, Math.max(1, rawStartAt))

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return Response.json({ error: 'O arquivo não é um PDF válido.' }, { status: 400 })

    const result = await addPageNumbers(buffer, { placement, alignment, startAt })
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
