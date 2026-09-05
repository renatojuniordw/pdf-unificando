import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/utils/logger', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}))

vi.mock('@/lib/queue', () => ({
  validateRateLimit: vi.fn(() => undefined),
  binaryLimit: vi.fn((fn: () => unknown) => fn()),
  isOverloaded: vi.fn(() => false),
  RETRY_AFTER: 30,
}))

vi.mock('@/lib/utils/http', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils/http')>('@/lib/utils/http')
  return {
    ...actual,
    parseSinglePdfUpload: vi.fn(),
    parseImageUploads: vi.fn(),
    parsePdfUploads: vi.fn(),
  }
})

vi.mock('@/lib/pdf/compress', () => ({ compressPdf: vi.fn() }))
vi.mock('@/lib/pdf/protect', () => ({ protectPdf: vi.fn() }))
vi.mock('@/lib/pdf/organize', () => ({ organizePdf: vi.fn() }))
vi.mock('@/lib/pdf/from-jpg', () => ({ jpgToPdf: vi.fn() }))
vi.mock('@/lib/pdf/rotate', () => ({ rotatePdf: vi.fn() }))
vi.mock('@/lib/pdf/to-jpg', () => ({ pdfToJpg: vi.fn() }))
vi.mock('@/lib/pdf/to-png', () => ({ pdfToPng: vi.fn() }))
vi.mock('@/lib/pdf/to-markdown', () => ({ pdfToMarkdown: vi.fn() }))
vi.mock('@/lib/pdf/to-word', () => ({ pdfToWord: vi.fn() }))
vi.mock('@/lib/pdf/watermark', () => ({ watermarkPdf: vi.fn() }))

import { POST as compressRoute } from '@/app/api/pdf/compress/route'
import { POST as protectRoute } from '@/app/api/pdf/protect/route'
import { POST as organizeRoute } from '@/app/api/pdf/organize/route'
import { POST as fromJpgRoute } from '@/app/api/pdf/from-jpg/route'
import { POST as rotateRoute } from '@/app/api/pdf/rotate/route'
import { POST as toJpgRoute } from '@/app/api/pdf/to-jpg/route'
import { POST as toPngRoute } from '@/app/api/pdf/to-png/route'
import { POST as toMarkdownRoute } from '@/app/api/pdf/to-markdown/route'
import { POST as toWordRoute } from '@/app/api/pdf/to-word/route'
import { POST as watermarkRoute } from '@/app/api/pdf/watermark/route'

import { compressPdf } from '@/lib/pdf/compress'
import { protectPdf } from '@/lib/pdf/protect'
import { organizePdf } from '@/lib/pdf/organize'
import { jpgToPdf } from '@/lib/pdf/from-jpg'
import { rotatePdf } from '@/lib/pdf/rotate'
import { pdfToJpg } from '@/lib/pdf/to-jpg'
import { pdfToPng } from '@/lib/pdf/to-png'
import { pdfToMarkdown } from '@/lib/pdf/to-markdown'
import { pdfToWord } from '@/lib/pdf/to-word'
import { watermarkPdf } from '@/lib/pdf/watermark'
import { parseSinglePdfUpload, parseImageUploads, parsePdfUploads } from '@/lib/utils/http'

function makeReq(path: string, fd: FormData, ip = '10.0.0.1'): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: fd,
    headers: { 'x-real-ip': ip },
  })
}

const PDF_BUF = Buffer.from('%PDF-1.4')

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(parseSinglePdfUpload).mockImplementation(async (req: Request) => {
    const formData = await req.formData()
    return { formData, buffer: PDF_BUF, fileName: 'doc.pdf' }
  })
  vi.mocked(parseImageUploads).mockImplementation(async (req: Request) => {
    const formData = await req.formData()
    return { formData, buffers: [Buffer.from([0xff, 0xd8])], fileNames: ['img.jpg'] }
  })
  vi.mocked(parsePdfUploads).mockImplementation(async () => ({
    formData: new FormData(),
    buffers: [PDF_BUF, PDF_BUF],
    fileNames: ['a.pdf', 'b.pdf'],
  }))
})

async function expectPdfStream(res: Response, filename: string) {
  expect(res.status).toBe(200)
  expect(res.headers.get('Content-Type')).toBe('application/pdf')
  expect(res.headers.get('Content-Disposition')).toBe(`attachment; filename="${filename}"`)
}

describe('POST /api/pdf/compress', () => {
  it('COMPRESS_POST_DefaultQuality_StreamsPdfWithSizeHeaders', async () => {
    vi.mocked(compressPdf).mockResolvedValue({ buffer: PDF_BUF, originalSize: 100, compressedSize: 40 })
    const res = await compressRoute(makeReq('/api/pdf/compress', new FormData()))
    await expectPdfStream(res, 'doc_unificando.pdf')
    expect(compressPdf).toHaveBeenCalledWith(expect.any(Buffer), 'medium')
    expect(res.headers.get('X-Original-Size')).toBe('100')
    expect(res.headers.get('X-Compressed-Size')).toBe('40')
  })

  it('COMPRESS_POST_ExplicitQuality_ForwardsQuality', async () => {
    vi.mocked(compressPdf).mockResolvedValue({ buffer: PDF_BUF, originalSize: 1, compressedSize: 1 })
    const fd = new FormData()
    fd.set('quality', 'high')
    await compressRoute(makeReq('/api/pdf/compress', fd))
    expect(compressPdf).toHaveBeenCalledWith(expect.any(Buffer), 'high')
  })

  it('COMPRESS_POST_LibError_Returns500', async () => {
    vi.mocked(compressPdf).mockRejectedValue(Object.assign(new Error('gs'), { status: 500 }))
    const res = await compressRoute(makeReq('/api/pdf/compress', new FormData()))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/pdf/protect', () => {
  it('PROTECT_POST_MissingPassword_Returns400', async () => {
    const res = await protectRoute(makeReq('/api/pdf/protect', new FormData()))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'password', reason: 'missing_password' })
  })

  it('PROTECT_POST_ValidPassword_StreamsProtectedPdf', async () => {
    vi.mocked(protectPdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('password', 'segredo123')
    const res = await protectRoute(makeReq('/api/pdf/protect', fd))
    await expectPdfStream(res, 'doc_unificando.pdf')
    expect(protectPdf).toHaveBeenCalledWith(expect.any(Buffer), { password: 'segredo123' })
  })

  it('PROTECT_POST_WhitespacePassword_Returns400', async () => {
    const fd = new FormData()
    fd.set('password', '   ')
    const res = await protectRoute(makeReq('/api/pdf/protect', fd))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/pdf/organize', () => {
  it('ORGANIZE_POST_MissingOrder_Returns400', async () => {
    const res = await organizeRoute(makeReq('/api/pdf/organize', new FormData()))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'order', reason: 'missing_order' })
  })

  it('ORGANIZE_POST_ValidOrder_StreamsPdf', async () => {
    vi.mocked(organizePdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('order', '2,1,3')
    const res = await organizeRoute(makeReq('/api/pdf/organize', fd))
    await expectPdfStream(res, 'doc_unificando.pdf')
    expect(organizePdf).toHaveBeenCalledWith(expect.any(Buffer), '2,1,3')
  })
})

describe('POST /api/pdf/from-jpg', () => {
  it('FROMJPG_POST_DefaultOrientation_IsPortrait', async () => {
    vi.mocked(jpgToPdf).mockResolvedValue(PDF_BUF)
    const res = await fromJpgRoute(makeReq('/api/pdf/from-jpg', new FormData()))
    expect(res.status).toBe(200)
    expect(jpgToPdf).toHaveBeenCalledWith(expect.any(Array), 'portrait')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="img_unificando.pdf"')
  })

  it('FROMJPG_POST_ExplicitLandscape_ForwardsOrientation', async () => {
    vi.mocked(jpgToPdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('orientation', 'landscape')
    const res = await fromJpgRoute(makeReq('/api/pdf/from-jpg', fd))
    expect(res.status).toBe(200)
    expect(jpgToPdf).toHaveBeenCalledWith(expect.any(Array), 'landscape')
  })
})

describe('POST /api/pdf/rotate', () => {
  it('ROTATE_POST_DefaultDegrees90AndScopeAll', async () => {
    vi.mocked(rotatePdf).mockResolvedValue(PDF_BUF)
    const res = await rotateRoute(makeReq('/api/pdf/rotate', new FormData()))
    await expectPdfStream(res, 'doc_unificando.pdf')
    expect(rotatePdf).toHaveBeenCalledWith(expect.any(Buffer), 90, 'all', undefined)
  })

  it('ROTATE_POST_ScopePageWithPage_ConvertsToOneBasedIndex', async () => {
    vi.mocked(rotatePdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('degrees', '270')
    fd.set('scope', 'page')
    fd.set('page', '3')
    await rotateRoute(makeReq('/api/pdf/rotate', fd))
    expect(rotatePdf).toHaveBeenCalledWith(expect.any(Buffer), 270, 'page', 2)
  })

  it('ROTATE_POST_InvalidPageNumber_YieldsUndefinedPage', async () => {
    vi.mocked(rotatePdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('page', 'abc')
    await rotateRoute(makeReq('/api/pdf/rotate', fd))
    expect(rotatePdf).toHaveBeenCalledWith(expect.any(Buffer), 90, 'all', undefined)
  })
})

describe('POST /api/pdf/to-jpg', () => {
  it('TOJPG_POST_DefaultDpi150_ReturnsJpegForSingleImage', async () => {
    vi.mocked(pdfToJpg).mockResolvedValue(Buffer.from('%PDF'))
    const res = await toJpgRoute(makeReq('/api/pdf/to-jpg', new FormData()))
    expect(res.status).toBe(200)
    expect(pdfToJpg).toHaveBeenCalledWith(expect.any(Buffer), '150')
    expect(res.headers.get('Content-Type')).toBe('image/jpeg')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc_unificando.jpg"')
  })

  it('TOJPG_POST_Dpi72_ForwardsAndZipResult_UsesZipMime', async () => {
    vi.mocked(pdfToJpg).mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
    const fd = new FormData()
    fd.set('dpi', '72')
    const res = await toJpgRoute(makeReq('/api/pdf/to-jpg', fd))
    expect(pdfToJpg).toHaveBeenCalledWith(expect.any(Buffer), '72')
    expect(res.headers.get('Content-Type')).toBe('application/zip')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc_unificando.zip"')
  })

  it('TOJPG_POST_InvalidDpi_FallsBackTo150', async () => {
    vi.mocked(pdfToJpg).mockResolvedValue(Buffer.from('%PDF'))
    const fd = new FormData()
    fd.set('dpi', '999')
    await toJpgRoute(makeReq('/api/pdf/to-jpg', fd))
    expect(pdfToJpg).toHaveBeenCalledWith(expect.any(Buffer), '150')
  })
})

describe('POST /api/pdf/to-png', () => {
  it('TOPNG_POST_DefaultDpi150_ReturnsPngForSingleImage', async () => {
    vi.mocked(pdfToPng).mockResolvedValue(Buffer.from('%PDF'))
    const res = await toPngRoute(makeReq('/api/pdf/to-png', new FormData()))
    expect(res.status).toBe(200)
    expect(pdfToPng).toHaveBeenCalledWith(expect.any(Buffer), '150')
    expect(res.headers.get('Content-Type')).toBe('image/png')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc_unificando.png"')
  })

  it('TOPNG_POST_Dpi300AndZipResult_UsesZipMime', async () => {
    vi.mocked(pdfToPng).mockResolvedValue(Buffer.from([0x50, 0x4b, 0x03, 0x04]))
    const fd = new FormData()
    fd.set('dpi', '300')
    const res = await toPngRoute(makeReq('/api/pdf/to-png', fd))
    expect(pdfToPng).toHaveBeenCalledWith(expect.any(Buffer), '300')
    expect(res.headers.get('Content-Type')).toBe('application/zip')
  })
})

describe('POST /api/pdf/to-markdown', () => {
  it('TOMARKDOWN_POST_ValidUpload_StreamsMarkdown', async () => {
    vi.mocked(pdfToMarkdown).mockResolvedValue(Buffer.from('# md'))
    const res = await toMarkdownRoute(makeReq('/api/pdf/to-markdown', new FormData()))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc_unificando.md"')
    expect(pdfToMarkdown).toHaveBeenCalledWith(expect.any(Buffer))
  })
})

describe('POST /api/pdf/to-word', () => {
  it('TOWORD_POST_ValidUpload_StreamsDocx', async () => {
    vi.mocked(pdfToWord).mockResolvedValue(Buffer.from('%DOCX'))
    const res = await toWordRoute(makeReq('/api/pdf/to-word', new FormData()))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="doc_unificando.docx"')
    expect(pdfToWord).toHaveBeenCalledWith(expect.any(Buffer))
  })
})

describe('POST /api/pdf/watermark', () => {
  it('WATERMARK_POST_MissingText_Returns400', async () => {
    const res = await watermarkRoute(makeReq('/api/pdf/watermark', new FormData()))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.details).toMatchObject({ field: 'text', reason: 'missing_text' })
  })

  it('WATERMARK_POST_Defaults_ColorGrayOpacity03Font60', async () => {
    vi.mocked(watermarkPdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('text', 'CONFIDENCIAL')
    const res = await watermarkRoute(makeReq('/api/pdf/watermark', fd))
    await expectPdfStream(res, 'doc_unificando.pdf')
    expect(watermarkPdf).toHaveBeenCalledWith(expect.any(Buffer), {
      text: 'CONFIDENCIAL',
      opacity: 0.3,
      fontSize: 60,
      color: 'gray',
    })
  })

  it('WATERMARK_POST_ExplicitParams_ColorRedOpacityClampedTo05', async () => {
    vi.mocked(watermarkPdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('text', 'X')
    fd.set('color', 'red')
    fd.set('opacity', '0.01')
    fd.set('fontSize', '500')
    await watermarkRoute(makeReq('/api/pdf/watermark', fd))
    expect(watermarkPdf).toHaveBeenCalledWith(expect.any(Buffer), {
      text: 'X',
      opacity: 0.05,
      fontSize: 120,
      color: 'red',
    })
  })

  it('WATERMARK_POST_InvalidColorAndNumbers_FallsBackToDefaults', async () => {
    vi.mocked(watermarkPdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('text', 'X')
    fd.set('color', 'neon')
    fd.set('opacity', 'abc')
    fd.set('fontSize', 'abc')
    await watermarkRoute(makeReq('/api/pdf/watermark', fd))
    expect(watermarkPdf).toHaveBeenCalledWith(expect.any(Buffer), {
      text: 'X',
      opacity: 0.3,
      fontSize: 60,
      color: 'gray',
    })
  })

  it('WATERMARK_POST_OpacityAboveOne_ClampedToOne', async () => {
    vi.mocked(watermarkPdf).mockResolvedValue(PDF_BUF)
    const fd = new FormData()
    fd.set('text', 'X')
    fd.set('opacity', '2')
    await watermarkRoute(makeReq('/api/pdf/watermark', fd))
    expect(watermarkPdf).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.objectContaining({ opacity: 1 }),
    )
  })
})