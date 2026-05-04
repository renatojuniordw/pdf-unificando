import { type NextRequest } from 'next/server'
import { compressPdf, type CompressionQuality } from '@/lib/pdf/compress'
import { binaryLimit, isOverloaded, rateLimitResponse } from '@/lib/queue'
import { buildOutputFilename, errorResponse, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  if (isOverloaded()) return rateLimitResponse()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const rawQuality = formData.get('quality')
    const quality: CompressionQuality =
      rawQuality === 'low' || rawQuality === 'medium' || rawQuality === 'high'
        ? rawQuality
        : 'medium'

    const { buffer: compressed, originalSize, compressedSize } =
      await binaryLimit(() => compressPdf(buffer, quality))

    const res = streamResponse(compressed, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
    res.headers.set('X-Original-Size', String(originalSize))
    res.headers.set('X-Compressed-Size', String(compressedSize))
    return res
  } catch (err) {
    return errorResponse(err)
  }
}
