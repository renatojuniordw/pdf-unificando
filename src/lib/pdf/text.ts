import path from 'path'

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'

export type TextLikeItem = {
  str?: string
  transform?: number[]
  width?: number
  height?: number
}

type LineFragment = {
  text: string
  x: number
}

export async function extractPdfTextLines(buffer: Buffer): Promise<string[][]> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)
  const pdf = await getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    standardFontDataUrl: STANDARD_FONTS_URL,
    useSystemFonts: true,
  } as Parameters<typeof getDocument>[0]).promise

  const pages: string[][] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const lines = groupTextIntoLines(content.items as TextLikeItem[])

    pages.push(lines.length > 0 ? lines : [''])
    page.cleanup()
  }

  return pages
}

export function ensurePdfHasExtractableText(pages: string[][]): void {
  const hasText = pages.some((lines) => lines.some((line) => line.trim().length > 0))

  if (!hasText) {
    throw Object.assign(
      new Error('Não foi possível extrair texto do PDF. PDFs escaneados ou compostos apenas por imagem exigem OCR.'),
      { status: 422 },
    )
  }
}

function groupTextIntoLines(items: TextLikeItem[]): string[] {
  const rows = new Map<string, LineFragment[]>()

  for (const item of items) {
    const text = item.str?.trim()
    const transform = item.transform

    if (!text || !transform || transform.length < 6) continue

    const x = transform[4] ?? 0
    const y = transform[5] ?? 0
    const rowKey = String(Math.round(y * 2) / 2)
    const fragments = rows.get(rowKey) ?? []

    fragments.push({ text, x })
    rows.set(rowKey, fragments)
  }

  return [...rows.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([, fragments]) =>
      fragments
        .sort((a, b) => a.x - b.x)
        .map((fragment) => fragment.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}
