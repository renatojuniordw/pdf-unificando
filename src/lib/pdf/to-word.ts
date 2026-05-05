import path from 'path'
import { Writable } from 'stream'
import archiver from 'archiver'

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'

type TextLikeItem = {
  str?: string
  transform?: number[]
  width?: number
}

type LineFragment = {
  text: string
  x: number
}

export async function pdfToWord(buffer: Buffer): Promise<Buffer> {
  const pages = await extractPdfText(buffer)
  const hasText = pages.some((lines) => lines.some((line) => line.trim().length > 0))

  if (!hasText) {
    throw Object.assign(
      new Error('Nao foi possivel extrair texto do PDF. PDFs escaneados ou compostos apenas por imagem exigem OCR.'),
      { status: 422 }
    )
  }

  return buildDocx(pages)
}

async function extractPdfText(buffer: Buffer): Promise<string[][]> {
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
        .trim()
    )
    .filter(Boolean)
}

async function buildDocx(pages: string[][]): Promise<Buffer> {
  const documentXml = buildDocumentXml(pages)

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const archive = archiver('zip', { zlib: { level: 0 } })
    const sink = new Writable({
      write(chunk: Buffer, _enc: string, cb: () => void) {
        chunks.push(chunk)
        cb()
      },
    })

    sink.on('finish', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)
    archive.pipe(sink)

    archive.append(buildContentTypesXml(), { name: '[Content_Types].xml', store: true })
    archive.append(buildRootRelsXml(), { name: '_rels/.rels', store: true })
    archive.append(buildAppXml(), { name: 'docProps/app.xml', store: true })
    archive.append(buildCoreXml(), { name: 'docProps/core.xml', store: true })
    archive.append(buildDocumentRelsXml(), { name: 'word/_rels/document.xml.rels', store: true })
    archive.append(buildStylesXml(), { name: 'word/styles.xml', store: true })
    archive.append(buildDocumentXml(pages), { name: 'word/document.xml', store: true })

    archive.finalize()
  })
}

function buildDocumentXml(pages: string[][]): string {
  const body = pages
    .map((lines, pageIndex) => {
      const paragraphs = lines.map((line) => paragraphXml(line)).join('')
      const pageBreak = pageIndex < pages.length - 1 ? pageBreakXml() : ''
      return `${paragraphs}${pageBreak}`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body || paragraphXml('')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

function paragraphXml(text: string): string {
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function pageBreakXml(): string {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
}

function buildRootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
}

function buildDocumentRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
  </w:style>
</w:styles>`
}

function buildCoreXml(): string {
  const createdAt = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>PDF convertido para Word</dc:title>
  <dc:creator>Unificando</dc:creator>
  <cp:lastModifiedBy>Unificando</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`
}

function buildAppXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Unificando</Application>
</Properties>`
}
