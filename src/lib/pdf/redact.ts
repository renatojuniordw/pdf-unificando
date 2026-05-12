import path from 'path'
import { PDFDocument } from 'pdf-lib'

export interface RedactRegion {
  page: number    // 0-based page index
  x: number       // relative position from left (0–1)
  y: number       // relative position from top (0–1)
  width: number   // relative width (0–1)
  height: number  // relative height (0–1)
}

function isValidRegion(region: RedactRegion): boolean {
  return (
    Number.isInteger(region.page) &&
    region.page >= 0 &&
    Number.isFinite(region.x) &&
    Number.isFinite(region.y) &&
    Number.isFinite(region.width) &&
    Number.isFinite(region.height) &&
    region.x >= 0 &&
    region.y >= 0 &&
    region.width > 0 &&
    region.height > 0 &&
    region.x <= 1 &&
    region.y <= 1 &&
    region.width <= 1 &&
    region.height <= 1 &&
    region.x + region.width <= 1 &&
    region.y + region.height <= 1
  )
}

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'
const WORKER_SRC = 'file://' + path.join(PDFJS_LEGACY, 'pdf.worker.mjs')

// Hybrid approach: pages without redactions are copied as-is (text preserved),
// pages with redactions are rendered to image with black boxes burned in.
export async function redactPdf(
  buffer: Buffer,
  regions: RedactRegion[],
  resolution: 72 | 144 | 216 = 144,
): Promise<Buffer> {
  const invalidRegion = regions.find((region) => !isValidRegion(region))
  if (invalidRegion) {
    throw Object.assign(new Error('Uma ou mais regiões de redação são inválidas.'), { status: 400 })
  }

  const redactedPageIndices = new Set(regions.map((r) => r.page))

  // Pages without redactions are copied directly from the source
  const srcDoc = await PDFDocument.load(buffer)
  const dstDoc = await PDFDocument.create()
  const pageCount = srcDoc.getPageCount()

  // Only boot pdfjs if there are pages that need image rendering
  let renderPage: ((pageNum: number) => Promise<Buffer>) | null = null

  if (redactedPageIndices.size > 0) {
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

    const scale = resolution / 72
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      CanvasFactory: NapiCanvasFactory,
      standardFontDataUrl: STANDARD_FONTS_URL,
      useSystemFonts: true,
    } as Parameters<typeof getDocument>[0]).promise

    renderPage = async (pageNum: number): Promise<Buffer> => {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const w = Math.ceil(viewport.width)
      const h = Math.ceil(viewport.height)
      const canvas = new Canvas(w, h)
      const ctx = canvas.getContext('2d')

      await page.render({ canvasContext: ctx, viewport } as Parameters<typeof page.render>[0]).promise

      const pageRegions = regions.filter((r) => r.page === pageNum - 1)
      ctx.fillStyle = '#000000'
      for (const region of pageRegions) {
        ctx.fillRect(Math.floor(region.x * w), Math.floor(region.y * h), Math.ceil(region.width * w), Math.ceil(region.height * h))
      }

      page.cleanup()
      return canvas.toBuffer('image/png')
    }
  }

  for (let i = 0; i < pageCount; i++) {
    if (!redactedPageIndices.has(i)) {
      const [copied] = await dstDoc.copyPages(srcDoc, [i])
      dstDoc.addPage(copied)
    } else {
      const srcPage = srcDoc.getPage(i)
      const { width: pgW, height: pgH } = srcPage.getSize()
      const imgBuffer = await renderPage!(i + 1)
      const pngImage = await dstDoc.embedPng(imgBuffer)
      const page = dstDoc.addPage([pgW, pgH])
      page.drawImage(pngImage, { x: 0, y: 0, width: pgW, height: pgH })
    }
  }

  return Buffer.from(await dstDoc.save())
}
