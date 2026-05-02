import { type NextRequest } from 'next/server'
import { mergePdfs } from '@/lib/pdf/merge'
import { readFormFiles, errorResponse, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    const buffers = await readFormFiles(req)
    if (buffers.length < 2) {
      return Response.json({ error: 'Envie pelo menos 2 arquivos.' }, { status: 400 })
    }

    const merged = await mergePdfs(buffers)
    return streamResponse(merged, 'unificado.pdf', 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
