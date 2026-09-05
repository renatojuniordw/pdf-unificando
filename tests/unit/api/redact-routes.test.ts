import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

const routeState = vi.hoisted(() => ({
  pdf: null as Parameters<typeof getDocumentFake>[0] | null,
  getDocument: null as ReturnType<typeof vi.fn> | null,
}))

type RawItem = {
  str: string
  transform: number[]
  width: number
  height: number
}

type FakePage = {
  width: number
  height: number
  items?: RawItem[]
}

function getDocumentFake(_opts: unknown) {
  return { promise: Promise.resolve(routeState.pdf) }
}

vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  getDocument: routeState.getDocument,
  GlobalWorkerOptions: {},
}))

vi.mock('@/lib/queue', () => ({
  validateRateLimit: vi.fn(),
  binaryLimit: vi.fn((fn: () => unknown) => fn()),
  isOverloaded: vi.fn(() => false),
}))

vi.mock('@/lib/utils/http', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils/http')>('@/lib/utils/http')
  return {
    ...actual,
    parseSinglePdfUpload: vi.fn(),
  }
})

vi.mock('@/lib/pdf/redact', () => ({
  redactPdf: vi.fn(),
}))

import { POST as redactRoute } from '@/app/api/pdf/redact/route'
import { POST as redactPreviewRoute } from '@/app/api/pdf/redact/preview/route'
import { POST as redactSearchRoute } from '@/app/api/pdf/redact/search/route'
import { redactPdf } from '@/lib/pdf/redact'
import { parseSinglePdfUpload } from '@/lib/utils/http'
import { validateRateLimit } from '@/lib/queue'
import { createApiError } from '@/lib/utils/http'

function makePdfDoc(pages: FakePage[]) {
  return {
    numPages: pages.length,
    getPage: vi.fn(async (n: number) => ({
      getViewport: () => ({ scale: 1, width: pages[n - 1].width, height: pages[n - 1].height }),
      render: () => ({ promise: Promise.resolve() }),
      getTextContent: () => Promise.resolve({ items: pages[n - 1].items ?? [] }),
      cleanup: vi.fn(),
    })),
  }
}

function makeReq(path: string, fd: FormData, ip = '10.0.0.1'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: fd,
    headers: { 'x-real-ip': ip },
  })
}

const VALID_REGIONS = '[{"page":0,"x":0.1,"y":0.1,"width":0.2,"height":0.2}]'

beforeAll(() => {
  routeState.getDocument = vi.fn(getDocumentFake)
})

beforeEach(() => {
  vi.clearAllMocks()
  ;(validateRateLimit as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
  ;(redactPdf as ReturnType<typeof vi.fn>).mockResolvedValue(Buffer.from('%PDF-redacted'))
  vi.mocked(parseSinglePdfUpload).mockImplementation(async (req: Request) => {
    const fd = await req.formData()
    return { formData: fd, buffer: Buffer.from('%PDF-1.4'), fileName: 'doc.pdf' }
  })
})

describe('POST /api/pdf/redact', () => {
  it('REDACT_POST_MissingRegions_Returns400MissingRegions', async () => {
    const fd = new FormData()
    fd.set('file', new File([Buffer.from('%PDF-1.4')], 'doc.pdf'))
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details).toMatchObject({ field: 'regions', reason: 'missing_regions' })
  })

  it('REDACT_POST_InvalidRegionsJson_Returns400InvalidJson', async () => {
    const fd = new FormData()
    fd.set('regions', 'not-json{')
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'regions', reason: 'invalid_json' })
  })

  it('REDACT_POST_EmptyRegionsArray_Returns400MissingRegions', async () => {
    const fd = new FormData()
    fd.set('regions', '[]')
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'regions', reason: 'missing_regions' })
  })

  it('REDACT_POST_RegionsNotArray_Returns400MissingRegions', async () => {
    const fd = new FormData()
    fd.set('regions', '{"page":0}')
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'regions', reason: 'missing_regions' })
  })

  it.each([
    ['page_float', '[{"page":0.5,"x":0,"y":0,"width":1,"height":1}]'],
    ['null_element', '[null]'],
    ['string_element', '["region"]'],
  ])('REDACT_POST_InvalidRegionShape_Returns400InvalidShape (%s)', async (_label, regions) => {
    const fd = new FormData()
    fd.set('regions', regions)
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'regions', reason: 'invalid_shape' })
  })

  it('REDACT_POST_InvalidResolution_FallsBackTo144', async () => {
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    fd.set('resolution', '999')
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(200)
    expect(redactPdf).toHaveBeenCalledWith(expect.any(Buffer), expect.any(Array), 144)
  })

  it('REDACT_POST_MissingResolution_FallsBackTo144', async () => {
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(200)
    expect(redactPdf).toHaveBeenCalledWith(expect.any(Buffer), expect.any(Array), 144)
  })

  it('REDACT_POST_ValidResolution72_ForwardsResolution', async () => {
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    fd.set('resolution', '72')
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(200)
    expect(redactPdf).toHaveBeenCalledWith(expect.any(Buffer), expect.any(Array), 72)
  })

  it('REDACT_POST_ValidRequest_StreamsPdfWithDownloadHeaders', async () => {
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc_unificando.pdf"')
    const body = await res.arrayBuffer()
    expect(new Uint8Array(body).slice(0, 8)).toEqual(Uint8Array.from(Buffer.from('%PDF-red')))
  })

  it('REDACT_POST_RegionsParsed_PassesParsedRegionsToLib', async () => {
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(redactPdf).toHaveBeenCalledWith(
      expect.any(Buffer),
      [{ page: 0, x: 0.1, y: 0.1, width: 0.2, height: 0.2 }],
      expect.any(Number),
    )
  })

  it('REDACT_POST_LibExposes400_Returns400ValidationError', async () => {
    ;(redactPdf as ReturnType<typeof vi.fn>).mockRejectedValue(
      Object.assign(new Error('Uma ou mais regiões de redação são inválidas.'), { status: 400 }),
    )
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  it('REDACT_POST_RateLimited_Returns429', async () => {
    // validateRateLimit lança SÍNCRONO no código real; o route handler não faz
    // await. O mock deve lançar sincronamente (mockRejectedValue retornaria uma
    // promise rejeitada que o handler nunca aguardaria).
    ;(validateRateLimit as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw createApiError(429, 'RATE_LIMITED', 'Muitas requisições.', { reason: 'ip_rate_limited' }, true)
    })
    const fd = new FormData()
    fd.set('regions', VALID_REGIONS)
    const res = await redactRoute(makeReq('/api/pdf/redact', fd))
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error.code).toBe('RATE_LIMITED')
  })
})

describe('POST /api/pdf/redact/preview', () => {
  it('REDACT_PREVIEW_POST_ValidUpload_ReturnsRenderedPagesJson', async () => {
    routeState.pdf = makePdfDoc([{ width: 600, height: 800 }, { width: 300, height: 400 }])
    const fd = new FormData()
    fd.set('file', new File([Buffer.from('%PDF-1.4')], 'doc.pdf'))
    const res = await redactPreviewRoute(makeReq('/api/pdf/redact/preview', fd))
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const body = await res.json()
    expect(body.pages).toHaveLength(2)
    expect(body.pages[0]).toMatchObject({ width: 600, height: 800 })
    expect(body.pages[0].image).toMatch(/^data:image\/jpeg;base64,/)
    expect(body.pages[1].width).toBe(300)
  })

  it('REDACT_PREVIEW_POST_UploadFailure_Returns400ValidationError', async () => {
    vi.mocked(parseSinglePdfUpload).mockRejectedValue(
      createApiError(400, 'VALIDATION_ERROR', 'Arquivo não enviado.', { field: 'file', reason: 'missing_file' }),
    )
    const res = await redactPreviewRoute(makeReq('/api/pdf/redact/preview', new FormData()))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/pdf/redact/search', () => {
  it('REDACT_SEARCH_POST_MissingQuery_Returns400MissingQuery', async () => {
    const fd = new FormData()
    fd.set('file', new File([Buffer.from('%PDF-1.4')], 'doc.pdf'))
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'query', reason: 'missing_query' })
  })

  it('REDACT_SEARCH_POST_WhitespaceQuery_Returns400MissingQuery', async () => {
    const fd = new FormData()
    fd.set('query', '   ')
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details.reason).toBe('missing_query')
  })

  it('REDACT_SEARCH_POST_QueryTooLong_Returns400TooLong', async () => {
    const fd = new FormData()
    fd.set('query', 'a'.repeat(101))
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'query', reason: 'too_long' })
  })

  it('REDACT_SEARCH_POST_ValidQuery_ReturnsNormalizedRegions', async () => {
    routeState.pdf = makePdfDoc([
      {
        width: 600,
        height: 800,
        items: [{ str: 'Hello World', transform: [1, 0, 0, 24, 100, 700], width: 120, height: 24 }],
      },
    ])
    const fd = new FormData()
    fd.set('query', 'world')
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const body = await res.json()
    expect(body.regions).toHaveLength(1)
    expect(body.regions[0]).toMatchObject({
      page: 0,
      x: expect.closeTo(100 / 600, 4),
      y: expect.closeTo(1 - (700 + 24) / 800, 4),
      width: expect.closeTo(120 / 600, 4),
      height: expect.closeTo(24 / 800, 4),
    })
  })

  it('REDACT_SEARCH_POST_NoMatch_ReturnsEmptyRegions', async () => {
    routeState.pdf = makePdfDoc([
      {
        width: 600,
        height: 800,
        items: [{ str: 'Hello World', transform: [1, 0, 0, 24, 100, 700], width: 120, height: 24 }],
      },
    ])
    const fd = new FormData()
    fd.set('query', 'inexistente')
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.regions).toEqual([])
  })

  it('REDACT_SEARCH_POST_DegenerateOrOutOfBoundsItems_Skipped', async () => {
    routeState.pdf = makePdfDoc([
      {
        width: 600,
        height: 800,
        items: [
          { str: 'zero', transform: [1, 0, 0, 24, 100, 700], width: 0, height: 24 },
          { str: 'overflow', transform: [1, 0, 0, 24, 590, 700], width: 120, height: 24 },
        ],
      },
    ])
    const fd = new FormData()
    fd.set('query', 'zero')
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.regions).toEqual([])
  })

  it('REDACT_SEARCH_POST_MultipleOccurrencesAcrossItems_ReturnsDistinctRegions', async () => {
    routeState.pdf = makePdfDoc([
      {
        width: 600,
        height: 800,
        items: [
          { str: 'ana', transform: [1, 0, 0, 24, 100, 700], width: 50, height: 24 },
          { str: 'banana', transform: [1, 0, 0, 24, 200, 700], width: 80, height: 24 },
        ],
      },
    ])
    const fd = new FormData()
    fd.set('query', 'ana')
    const res = await redactSearchRoute(makeReq('/api/pdf/redact/search', fd))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.regions.length).toBe(2)
    expect(body.regions[0].x).not.toBe(body.regions[1].x)
  })
})