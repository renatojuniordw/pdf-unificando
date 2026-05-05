import { PDFDocument, rgb } from 'pdf-lib'

export interface RedactRegion {
  page: number    // 0-based page index
  x: number       // relative position from left (0–1)
  y: number       // relative position from top (0–1)
  width: number   // relative width (0–1)
  height: number  // relative height (0–1)
}

export async function redactPdf(buffer: Buffer, regions: RedactRegion[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer)
  const pages = pdfDoc.getPages()

  for (const region of regions) {
    const page = pages[region.page]
    if (!page) continue
    const { width, height } = page.getSize()

    const x = region.x * width
    const w = region.width * width
    const h = region.height * height
    // PDF origin is bottom-left; our regions use top-left origin
    const y = height - (region.y + region.height) * height

    page.drawRectangle({ x, y, width: w, height: h, color: rgb(0, 0, 0), opacity: 1 })
  }

  return Buffer.from(await pdfDoc.save())
}
