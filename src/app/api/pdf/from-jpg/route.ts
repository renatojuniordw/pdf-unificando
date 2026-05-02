import { type NextRequest } from 'next/server'
import { jpgToPdf, type PageOrientation } from '@/lib/pdf/from-jpg'
import { errorResponse, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('file') as File[]
    if (!files.length) return Response.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })

    const buffers = await Promise.all(files.map(f => f.arrayBuffer().then(Buffer.from)))
    const orientation = (formData.get('orientation') as PageOrientation) ?? 'portrait'

    const result = await jpgToPdf(buffers, orientation)
    return streamResponse(result, 'imagens.pdf', 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
