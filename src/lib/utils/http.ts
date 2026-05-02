import { NextResponse } from 'next/server'

const MAX_SIZE = Number(process.env.MAX_FILE_SIZE ?? 52_428_800) // 50MB

export async function readFormFile(req: Request): Promise<Buffer> {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    throw Object.assign(new Error('Nenhum arquivo enviado.'), { status: 400 })
  }

  const bytes = await (file as File).arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (buffer.byteLength > MAX_SIZE) {
    throw Object.assign(new Error('Arquivo muito grande. Limite: 50MB.'), { status: 413 })
  }

  return buffer
}

export async function readFormFiles(req: Request): Promise<Buffer[]> {
  const formData = await req.formData()
  const files = formData.getAll('file') as File[]

  if (!files.length) {
    throw Object.assign(new Error('Nenhum arquivo enviado.'), { status: 400 })
  }

  return Promise.all(
    files.map(async f => {
      const bytes = await f.arrayBuffer()
      const buffer = Buffer.from(bytes)
      if (buffer.byteLength > MAX_SIZE) {
        throw Object.assign(new Error('Arquivo muito grande. Limite: 50MB.'), { status: 413 })
      }
      return buffer
    })
  )
}

export function errorResponse(err: unknown): NextResponse {
  const e = err as { message?: string; status?: number }
  const status = e?.status ?? 500
  const message = e?.message ?? 'Erro interno. Tente novamente.'
  return NextResponse.json({ error: message }, { status })
}

export function streamResponse(buffer: Buffer, filename: string, mimeType: string): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
