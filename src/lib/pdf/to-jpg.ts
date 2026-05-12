import path from 'path'
import { Writable } from 'stream'
import archiver from 'archiver'

export type JpgDpi = '72' | '150' | '300'

const PDF_DPI = 72
const DPI_SCALE: Record<JpgDpi, number> = {
  '72': 1,
  '150': 150 / PDF_DPI,
  '300': 300 / PDF_DPI,
}

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'
const WORKER_SRC = 'file://' + path.join(PDFJS_LEGACY, 'pdf.worker.mjs')

export async function pdfToJpg(buffer: Buffer, dpi: JpgDpi = '150'): Promise<Buffer> {
  if (dpi !== '72' && dpi !== '150' && dpi !== '300') {
    throw new Error('DPI inválido.')
  }

  // @napi-rs/canvas is an optional dep of pdfjs-dist; we use it as the canvas backend.
  const { Canvas, ImageData, Path2D, DOMMatrix } = await import('@napi-rs/canvas')

  // Polyfill globals required by the pdfjs legacy build in Node.js
  ;(globalThis as Record<string, unknown>).ImageData ??= ImageData
  ;(globalThis as Record<string, unknown>).Path2D ??= Path2D
  ;(globalThis as Record<string, unknown>).DOMMatrix ??= DOMMatrix

  const { getDocument, GlobalWorkerOptions } = await import(
    'pdfjs-dist/legacy/build/pdf.mjs' as string
  )
  GlobalWorkerOptions.workerSrc = WORKER_SRC

  // pdfjs-dist's built-in NodeCanvasFactory uses process.getBuiltinModule (Node 22+).
  // We provide our own factory so it works on Node 20 (Docker image).
  class NapiCanvasFactory {
    // pdfjs calls: new CanvasFactory({ enableHWA?, ownerDocument?, ... })
    constructor(_opts?: unknown) {}

    create(width: number, height: number) {
      if (width <= 0 || height <= 0) throw new Error('Invalid canvas size')
      const canvas = new Canvas(width, height)
      return { canvas, context: canvas.getContext('2d') }
    }

    reset(obj: { canvas: InstanceType<typeof Canvas> }, width: number, height: number) {
      if (!obj.canvas) throw new Error('Canvas is not specified')
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
    // CanvasFactory (capitalized) is the CLASS — pdfjs instantiates it internally
    CanvasFactory: NapiCanvasFactory,
    standardFontDataUrl: STANDARD_FONTS_URL,
    useSystemFonts: true,
  } as Parameters<typeof getDocument>[0]).promise

  const scale = DPI_SCALE[dpi]
  const jpegBuffers: Buffer[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const w = Math.ceil(viewport.width)
    const h = Math.ceil(viewport.height)
    const canvas = new Canvas(w, h)

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    } as Parameters<typeof page.render>[0]).promise

    jpegBuffers.push(canvas.toBuffer('image/jpeg', 90))
    page.cleanup()
  }

  if (jpegBuffers.length === 1) return jpegBuffers[0]
  return zipBuffers(jpegBuffers)
}

async function zipBuffers(buffers: Buffer[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const archive = archiver('zip', { zlib: { level: 6 } })
    const sink = new Writable({
      write(chunk: Buffer, _enc: string, cb: () => void) {
        chunks.push(chunk)
        cb()
      },
    })

    sink.on('finish', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)
    archive.pipe(sink)

    buffers.forEach((buf, i) => {
      archive.append(buf, { name: `page-${String(i + 1).padStart(3, '0')}.jpg` })
    })

    archive.finalize()
  })
}
