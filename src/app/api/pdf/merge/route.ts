import { type NextRequest } from 'next/server'
import { mergePdfs } from '@/lib/pdf/merge'
import { validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

const MAX_SIZE = Number(process.env.MAX_FILE_SIZE ?? 52_428_800)

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })
    const files = formData.getAll('file') as File[]

    if (files.length < 2) {
      return Response.json({ error: 'Envie pelo menos 2 arquivos.' }, { status: 400 })
    }

    const buffers = await Promise.all(
      files.map(async f => {
        const buf = Buffer.from(await f.arrayBuffer())
        if (buf.byteLength > MAX_SIZE) {
          throw Object.assign(new Error('Arquivo muito grande. Limite: 50MB.'), { status: 413 })
        }
        if (!isPdf(buf)) {
          throw Object.assign(new Error(`"${f.name}" não é um PDF válido.`), { status: 400 })
        }
        return buf
      })
    )

    const merged = await mergePdfs(buffers)
    return streamResponse(merged, buildOutputFilename(files[0].name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
