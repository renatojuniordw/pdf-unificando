import { type NextRequest } from 'next/server'
import { watermarkPdf, type WatermarkColor } from '@/lib/pdf/watermark'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })

    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const text = (formData.get('text') as string | null)?.trim() ?? ''
    if (!text) return Response.json({ error: 'Texto da marca d\'água não informado.' }, { status: 400 })
    if (text.length > 100) return Response.json({ error: 'Texto muito longo. Máximo: 100 caracteres.' }, { status: 400 })

    const rawColor = formData.get('color') as string | null
    const color: WatermarkColor =
      rawColor === 'gray' || rawColor === 'black' || rawColor === 'red' ? rawColor : 'gray'

    const rawOpacity = parseFloat(formData.get('opacity') as string ?? '0.3')
    const opacity = isNaN(rawOpacity) ? 0.3 : Math.min(1, Math.max(0.05, rawOpacity))

    const rawFontSize = parseInt(formData.get('fontSize') as string ?? '60', 10)
    const fontSize = isNaN(rawFontSize) ? 60 : Math.min(120, Math.max(20, rawFontSize))

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return Response.json({ error: 'O arquivo não é um PDF válido.' }, { status: 400 })

    const result = await watermarkPdf(buffer, { text, opacity, fontSize, color })

    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
