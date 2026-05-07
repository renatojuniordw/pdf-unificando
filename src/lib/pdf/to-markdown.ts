import path from 'path'

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'

type TextItem = {
  str?: string
  transform?: number[]
  height?: number
  width?: number
}

type RichFragment = {
  text: string
  x: number
  fontSize: number
}

type RichLine = {
  text: string
  fontSize: number
  y: number
}

export async function pdfToMarkdown(buffer: Buffer): Promise<Buffer> {
  const pages = await extractRichText(buffer)

  const hasText = pages.some((lines) => lines.some((l) => l.text.trim().length > 0))
  if (!hasText) {
    throw Object.assign(
      new Error(
        'Não foi possível extrair texto do PDF. PDFs escaneados ou compostos apenas por imagem exigem OCR.',
      ),
      { status: 422 },
    )
  }

  return Buffer.from(buildMarkdown(pages), 'utf-8')
}

async function extractRichText(buffer: Buffer): Promise<RichLine[][]> {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)
  const pdf = await getDocument({
    data: new Uint8Array(buffer),
    disableWorker: true,
    standardFontDataUrl: STANDARD_FONTS_URL,
    useSystemFonts: true,
  } as Parameters<typeof getDocument>[0]).promise

  const pages: RichLine[][] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    pages.push(groupIntoLines(content.items as TextItem[]))
    page.cleanup()
  }

  return pages
}

function groupIntoLines(items: TextItem[]): RichLine[] {
  const rows = new Map<string, RichFragment[]>()
  const yMap = new Map<string, number>()

  for (const item of items) {
    const text = item.str?.trim()
    const transform = item.transform
    if (!text || !transform || transform.length < 6) continue

    const x = transform[4] ?? 0
    const y = transform[5] ?? 0
    const fontSize = (item.height && item.height > 0) ? item.height : Math.abs(transform[3] ?? 0)
    const rowKey = String(Math.round(y * 2) / 2)

    if (!yMap.has(rowKey)) yMap.set(rowKey, y)
    const frags = rows.get(rowKey) ?? []
    frags.push({ text, x, fontSize })
    rows.set(rowKey, frags)
  }

  return [...rows.entries()]
    .sort((a, b) => (yMap.get(b[0]) ?? 0) - (yMap.get(a[0]) ?? 0))
    .map(([key, frags]) => {
      const sorted = frags.sort((a, b) => a.x - b.x)
      return {
        text: sorted.map((f) => f.text).join(' ').replace(/\s+/g, ' ').trim(),
        fontSize: Math.max(...sorted.map((f) => f.fontSize)),
        y: yMap.get(key) ?? 0,
      }
    })
    .filter((l) => l.text.length > 0)
}

function bodyFontSize(pages: RichLine[][]): number {
  const sizes = pages.flatMap((p) => p.map((l) => l.fontSize)).filter((s) => s > 0)
  if (sizes.length === 0) return 12
  sizes.sort((a, b) => a - b)
  return sizes[Math.floor(sizes.length * 0.5)]
}

function headingPrefix(fontSize: number, bodySize: number): string {
  const ratio = fontSize / bodySize
  if (ratio >= 2.0) return '# '
  if (ratio >= 1.5) return '## '
  if (ratio >= 1.25) return '### '
  return ''
}

function formatLine(text: string): string {
  // Unordered list bullets
  if (/^[•·▪▸►‣⁃]\s*/.test(text)) return '- ' + text.replace(/^[•·▪▸►‣⁃]\s*/, '')
  // Em/en dash used as bullet
  if (/^[–—]\s+/.test(text)) return '- ' + text.replace(/^[–—]\s+/, '')
  return text
}

function isListItem(text: string): boolean {
  // Unordered
  if (/^[•·▪▸►‣⁃–—]\s/.test(text)) return true
  // Numbered: "1." "1)" "(1)" "a." "a)"
  if (/^(\(?\d+[.)]\s|\(?[a-zA-Z][.)]\s)/.test(text)) return true
  return false
}

function buildMarkdown(pages: RichLine[][]): string {
  const body = bodyFontSize(pages)
  const pageParts: string[] = []

  for (const lines of pages) {
    const mdBlocks: string[] = []
    let paraLines: string[] = []
    let lastY: number | null = null
    let lastFontSize: number = body

    const flushParagraph = () => {
      if (paraLines.length > 0) {
        mdBlocks.push(paraLines.join(' '))
        paraLines = []
      }
    }

    for (const { text, fontSize, y } of lines) {
      const prefix = headingPrefix(fontSize, body)
      const isHeading = prefix !== ''
      const formatted = isHeading ? prefix + text : formatLine(text)
      const isList = !isHeading && isListItem(text)

      if (isHeading || isList) {
        flushParagraph()
        mdBlocks.push(formatted)
        lastY = y
        lastFontSize = fontSize
        continue
      }

      // Detect paragraph break by y-gap relative to expected line spacing
      if (lastY !== null && paraLines.length > 0) {
        const gap = lastY - y  // y decreases top→bottom in PDF coords
        const expectedSpacing = Math.max(lastFontSize, fontSize) * 1.8
        if (gap > expectedSpacing) {
          flushParagraph()
        }
      }

      paraLines.push(text)
      lastY = y
      lastFontSize = fontSize
    }

    flushParagraph()
    if (mdBlocks.length > 0) pageParts.push(mdBlocks.join('\n\n'))
  }

  return pageParts.join('\n\n---\n\n').trim() + '\n'
}
