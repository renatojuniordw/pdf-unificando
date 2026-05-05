import { type NextRequest } from 'next/server'
import { jpgToPdf, type PageOrientation } from '@/lib/pdf/from-jpg'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isJpg, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })
    const files = formData.getAll('file') as File[]
    if (!files.length) return Response.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })

    const buffers = await Promise.all(
      files.map(async f => {
        const buf = Buffer.from(await f.arrayBuffer())
        if (!isJpg(buf)) throw Object.assign(new Error(`"${f.name}" não é uma imagem JPG válida.`), { status: 400 })
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
