import { type NextRequest } from 'next/server'
import { jpgToPdf, type PageOrientation } from '@/lib/pdf/from-jpg'
import { buildOutputFilename, errorResponse, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    const files = formData.getAll('file') as File[]
    if (!files.length) return Response.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })

    const buffers = await Promise.all(files.map(f => f.arrayBuffer().then(Buffer.from)))
    const orientation = (formData.get('orientation') as PageOrientation) ?? 'portrait'

    const result = await jpgToPdf(buffers, orientation)
    return streamResponse(result, buildOutputFilename(files[0].name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
