import { PDFDocument } from 'pdf-lib'
import sharp from 'sharp'

export type PageOrientation = 'portrait' | 'landscape'

export async function jpgToPdf(
  buffers: Buffer[],
  orientation: PageOrientation = 'portrait'
): Promise<Buffer> {
  const doc = await PDFDocument.create()

  for (const buf of buffers) {
    const jpeg = await sharp(buf).jpeg({ quality: 90 }).toBuffer()
    const image = await doc.embedJpg(jpeg)

    const { width, height } = image.scale(1)

    const [w, h] =
      orientation === 'landscape' && width < height
        ? [height, width]
        : [width, height]

    const page = doc.addPage([w, h])
    page.drawImage(image, { x: 0, y: 0, width: w, height: h })
  }

  const bytes = await doc.save()
  return Buffer.from(bytes)
}
