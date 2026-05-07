import { type NextRequest } from 'next/server'
import { redactPdf, type RedactRegion } from '@/lib/pdf/redact'
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

    const regionsRaw = formData.get('regions') as string
    if (!regionsRaw) return Response.json({ error: 'Nenhuma área de redação informada.' }, { status: 400 })

    let regions: RedactRegion[]
    try {
      regions = JSON.parse(regionsRaw)
    } catch {
      return Response.json({ error: 'Formato de regiões inválido.' }, { status: 400 })
    }

    if (!Array.isArray(regions) || regions.length === 0) {
      return Response.json({ error: 'Nenhuma área de redação informada.' }, { status: 400 })
    }

    const resolutionRaw = Number(formData.get('resolution'))
    const resolution = ([72, 144, 216] as const).includes(resolutionRaw as 72 | 144 | 216)
      ? (resolutionRaw as 72 | 144 | 216)
      : 144

    const result = await redactPdf(buffer, regions, resolution)
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
