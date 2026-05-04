import { type NextRequest } from 'next/server'
import { organizePdf } from '@/lib/pdf/organize'
import { buildOutputFilename, errorResponse, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const order = formData.get('order') as string
    if (!order) return Response.json({ error: 'Informe a ordem das páginas.' }, { status: 400 })

    const result = await organizePdf(buffer, order)
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
