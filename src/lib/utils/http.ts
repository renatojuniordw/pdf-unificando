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

  // Validação básica de PDF se a extensão for pdf
  if (file.name.toLowerCase().endsWith('.pdf') && !isPdf(buffer)) {
    throw Object.assign(new Error('O arquivo não parece ser um PDF válido.'), { status: 400 })
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
      
      const name = f.name.toLowerCase()
      if (name.endsWith('.pdf') && !isPdf(buffer)) {
        throw Object.assign(new Error(`O arquivo "${f.name}" não é um PDF válido.`), { status: 400 })
      }
      if ((name.endsWith('.jpg') || name.endsWith('.jpeg')) && !isJpg(buffer)) {
        throw Object.assign(new Error(`O arquivo "${f.name}" não é uma imagem JPG válida.`), { status: 400 })
      }

      return buffer
    })
  )
}

export function errorResponse(err: unknown): NextResponse {
  const isProd = process.env.NODE_ENV === 'production'
  const e = err as { message?: string; status?: number }
  const status = e?.status ?? 500
  
  // Em produção, se for erro 500, ocultamos a mensagem real para evitar vazamentos
  const message = (status === 500 && isProd) 
    ? 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' 
    : (e?.message ?? 'Erro interno.')

  if (status === 500) {
    console.error('[API Error]:', err)
  }

  return NextResponse.json({ error: message }, { status })
}

export function buildOutputFilename(originalName: string, outputExt: string): string {
  const base = originalName
    .replace(/\.[^.]+$/, '') // Remove extensão
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9]/g, '_') // Troca tudo que não é alfanumérico por sublinhado
    .replace(/_{2,}/g, '_') // Remove sublinhados duplicados
    .substring(0, 100) // Limita tamanho

  return `${base}_unificando.${outputExt}`
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

export function isPdf(buffer: Buffer): boolean {
  // PDF magic bytes: %PDF- (25 50 44 46 2d)
  return buffer.length > 4 && 
    buffer[0] === 0x25 && 
    buffer[1] === 0x50 && 
    buffer[2] === 0x44 && 
    buffer[3] === 0x46 && 
    buffer[4] === 0x2d
}

export function isJpg(buffer: Buffer): boolean {
  // JPG magic bytes: FF D8 FF
  return buffer.length > 3 && 
    buffer[0] === 0xff && 
    buffer[1] === 0xd8 && 
    buffer[2] === 0xff
}
