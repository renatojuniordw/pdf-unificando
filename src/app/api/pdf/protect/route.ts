import { type NextRequest } from 'next/server'
import { protectPdf } from '@/lib/pdf/protect'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, isPdf, streamResponse, validateHoneypot } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })

    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const password = (formData.get('password') as string | null)?.trim() ?? ''
    if (!password) return Response.json({ error: 'Senha não informada.' }, { status: 400 })
    if (password.length > 128) return Response.json({ error: 'Senha muito longa.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return Response.json({ error: 'O arquivo não é um PDF válido.' }, { status: 400 })

    const result = await binaryLimit(() => protectPdf(buffer, { password }))

    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
