import path from 'path'
import { type NextRequest } from 'next/server'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { isPdf, validateHoneypot } from '@/lib/utils/http'

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'
const WORKER_SRC = 'file://' + path.join(PDFJS_LEGACY, 'pdf.worker.mjs')

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return Response.json({ error: 'Acesso negado.' }, { status: 400 })
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return Response.json({ error: 'O arquivo não é um PDF válido.' }, { status: 400 })

    const pages = await binaryLimit(() => renderPages(buffer))
    return Response.json({ pages }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Erro ao renderizar PDF.' }, { status: 500 })
  }
}

async function renderPages(buffer: Buffer): Promise<Array<{ image: string; width: number; height: number }>> {
  const { Canvas, ImageData, Path2D, DOMMatrix } = await import('@napi-rs/canvas')

  ;(globalThis as Record<string, unknown>).ImageData ??= ImageData
  ;(globalThis as Record<string, unknown>).Path2D ??= Path2D
  ;(globalThis as Record<string, unknown>).DOMMatrix ??= DOMMatrix

  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)
  GlobalWorkerOptions.workerSrc = WORKER_SRC

  class NapiCanvasFactory {
    constructor(_opts?: unknown) {}
    create(width: number, height: number) {
      if (width <= 0 || height <= 0) throw new Error('Invalid canvas size')
      const canvas = new Canvas(width, height)
      return { canvas, context: canvas.getContext('2d') }
    }
    reset(obj: { canvas: InstanceType<typeof Canvas> }, width: number, height: number) {
      obj.canvas.width = width
      obj.canvas.height = height
    }
    destroy(obj: { canvas: InstanceType<typeof Canvas> | null; context: unknown }) {
      obj.canvas = null
      obj.context = null
    }
  }

  const pdf = await getDocument({
    data: new Uint8Array(buffer),
    CanvasFactory: NapiCanvasFactory,
    standardFontDataUrl: STANDARD_FONTS_URL,
    useSystemFonts: true,
  } as Parameters<typeof getDocument>[0]).promise

  const result: Array<{ image: string; width: number; height: number }> = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1 }) // 72 DPI — sufficient for area selection
    const w = Math.ceil(viewport.width)
    const h = Math.ceil(viewport.height)
    const canvas = new Canvas(w, h)

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    } as Parameters<typeof page.render>[0]).promise

    result.push({
      image: `data:image/jpeg;base64,${canvas.toBuffer('image/jpeg', 85).toString('base64')}`,
      width: w,
      height: h,
    })
    page.cleanup()
  }

  return result
}
