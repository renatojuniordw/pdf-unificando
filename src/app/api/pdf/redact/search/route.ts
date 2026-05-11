import path from 'path'
import { type NextRequest } from 'next/server'
import { validateRateLimit } from '@/lib/queue'
import { apiErrorResponse, assertMaxFileSize, errorResponse, isFileEntry, isPdf, validateHoneypot } from '@/lib/utils/http'
import type { RedactRegion } from '@/lib/pdf/redact'

const PDFJS_LEGACY = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build')
const STANDARD_FONTS_URL = 'file://' + path.join(PDFJS_LEGACY, '../../standard_fonts') + '/'
const WORKER_SRC = 'file://' + path.join(PDFJS_LEGACY, 'pdf.worker.mjs')

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    if (!validateHoneypot(formData)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Acesso negado.', { field: '_hp', reason: 'honeypot_triggered' })

    const fileEntry = formData.get('file')
    if (!isFileEntry(fileEntry)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' })
    const file = fileEntry

    const query = (formData.get('query') as string | null)?.trim()
    if (!query) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Termo de busca não informado.', { field: 'query', reason: 'missing_query' })
    if (query.length > 100) return apiErrorResponse(400, 'VALIDATION_ERROR', 'Termo de busca muito longo.', { field: 'query', reason: 'too_long', maxLength: 100 })

    assertMaxFileSize(file)
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!isPdf(buffer)) return apiErrorResponse(400, 'VALIDATION_ERROR', 'O arquivo não é um PDF válido.', { field: 'file', reason: 'invalid_pdf' })

    const regions = await searchText(buffer, query)
    return Response.json({ regions }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return errorResponse(err)
  }
}

interface RawTextItem {
  str: string
  transform: number[]
  width: number
  height: number
}

async function searchText(buffer: Buffer, query: string): Promise<RedactRegion[]> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)
  GlobalWorkerOptions.workerSrc = WORKER_SRC

  const pdf = await getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl: STANDARD_FONTS_URL,
    useSystemFonts: true,
    // Disable rendering — we only need text content
    disableFontFace: true,
  } as Parameters<typeof getDocument>[0]).promise

  const regions: RedactRegion[] = []
  const lowerQuery = query.toLowerCase()

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1 })
    const pageWidth = viewport.width
    const pageHeight = viewport.height

    const textContent = await page.getTextContent()
    const items = (textContent.items as unknown[]).filter((item): item is RawTextItem =>
      typeof item === 'object' && item !== null && 'str' in item && typeof (item as RawTextItem).str === 'string'
    )

    // Build a concatenated string with a char→item index map
    let fullText = ''
    const charMap: number[] = []
    for (let i = 0; i < items.length; i++) {
      for (const ch of items[i].str) {
        charMap.push(i)
        fullText += ch
      }
    }

    const lowerFull = fullText.toLowerCase()
    let pos = 0
    while (pos < lowerFull.length) {
      const idx = lowerFull.indexOf(lowerQuery, pos)
      if (idx === -1) break

      // Collect distinct items involved in this match
      const matchedItemIndices = new Set<number>()
      for (let k = idx; k < idx + lowerQuery.length; k++) {
        if (charMap[k] !== undefined) matchedItemIndices.add(charMap[k])
      }

      for (const itemIdx of matchedItemIndices) {
        const item = items[itemIdx]
        const tx = item.transform[4]
        const ty = item.transform[5]
        // Font height from the scale component of the transform matrix
        const fontHeight = Math.abs(item.transform[3]) || Math.abs(item.transform[0]) || item.height || 12
        const itemWidth = item.width

        // PDF y-origin is bottom-left; our regions use top-left
        const normX = tx / pageWidth
        const normY = 1 - (ty + fontHeight) / pageHeight
        const normW = itemWidth / pageWidth
        const normH = fontHeight / pageHeight

        // Skip degenerate or out-of-bounds regions
        if (normW <= 0 || normH <= 0 || normX < 0 || normY < 0 || normX + normW > 1 || normY + normH > 1) {
          continue
        }

        regions.push({ page: pageNum - 1, x: normX, y: normY, width: normW, height: normH })
      }

      pos = idx + 1
    }

    page.cleanup()
  }

  // Deduplicate identical regions (same page + same bounding box)
  const seen = new Set<string>()
  return regions.filter((r) => {
    const key = `${r.page}:${r.x.toFixed(4)}:${r.y.toFixed(4)}:${r.width.toFixed(4)}:${r.height.toFixed(4)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
