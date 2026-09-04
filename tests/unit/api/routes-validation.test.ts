import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { POST as compressRoute } from '@/app/api/pdf/compress/route'
import { POST as rotateRoute } from '@/app/api/pdf/rotate/route'
import { POST as splitRoute } from '@/app/api/pdf/split/route'
import { POST as extractPagesRoute } from '@/app/api/pdf/extract-pages/route'
import { POST as organizeRoute } from '@/app/api/pdf/organize/route'
import { POST as pageNumbersRoute } from '@/app/api/pdf/page-numbers/route'
import { POST as protectRoute } from '@/app/api/pdf/protect/route'
import { POST as watermarkRoute } from '@/app/api/pdf/watermark/route'
import { POST as toJpgRoute } from '@/app/api/pdf/to-jpg/route'
import { POST as toPngRoute } from '@/app/api/pdf/to-png/route'
import { POST as toTxtRoute } from '@/app/api/pdf/to-txt/route'
import { POST as toMarkdownRoute } from '@/app/api/pdf/to-markdown/route'
import { POST as toWordRoute } from '@/app/api/pdf/to-word/route'
import { POST as redactRoute } from '@/app/api/pdf/redact/route'
import { POST as redactPreviewRoute } from '@/app/api/pdf/redact/preview/route'
import { POST as redactSearchRoute } from '@/app/api/pdf/redact/search/route'
import { POST as mergeRoute } from '@/app/api/pdf/merge/route'
import { POST as fromJpgRoute } from '@/app/api/pdf/from-jpg/route'

type Handler = (req: NextRequest) => Promise<Response>

const HANDLERS: Array<{ name: string; handler: Handler }> = [
  { name: 'compress', handler: compressRoute },
  { name: 'rotate', handler: rotateRoute },
  { name: 'split', handler: splitRoute },
  { name: 'extract-pages', handler: extractPagesRoute },
  { name: 'organize', handler: organizeRoute },
  { name: 'page-numbers', handler: pageNumbersRoute },
  { name: 'protect', handler: protectRoute },
  { name: 'watermark', handler: watermarkRoute },
  { name: 'to-jpg', handler: toJpgRoute },
  { name: 'to-png', handler: toPngRoute },
  { name: 'to-txt', handler: toTxtRoute },
  { name: 'to-markdown', handler: toMarkdownRoute },
  { name: 'to-word', handler: toWordRoute },
  { name: 'redact', handler: redactRoute },
  { name: 'redact/preview', handler: redactPreviewRoute },
  { name: 'redact/search', handler: redactSearchRoute },
  { name: 'merge', handler: mergeRoute },
  { name: 'from-jpg', handler: fromJpgRoute },
]

const PDF_BYTES = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
const BAD_BYTES = Uint8Array.from([1, 2, 3])

const pdfFile = () => new File([PDF_BYTES], 'a.pdf', { type: 'application/pdf' })
const badFile = () => new File([BAD_BYTES], 'a.pdf', { type: 'application/pdf' })

let ipCounter = 0
function makeRequest(apply: (fd: FormData) => void): NextRequest {
  const fd = new FormData()
  apply(fd)
  ipCounter += 1
  return new NextRequest('http://localhost/api/pdf/route', {
    method: 'POST',
    body: fd,
    headers: { 'x-real-ip': `10.0.0.${ipCounter}` },
  })
}

describe('API routes - validação compartilhada', () => {
  it.each(HANDLERS.map((h) => [h.name, h.handler] as const))(
    '[%s] rejeita honeypot disparado',
    async (_name, handler) => {
      const res = await handler(makeRequest((fd) => fd.set('_hp', 'bot')))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error.code).toBe('VALIDATION_ERROR')
    },
  )

  it.each(HANDLERS.map((h) => [h.name, h.handler] as const))(
    '[%s] rejeita requisição sem arquivo',
    async (_name, handler) => {
      const res = await handler(makeRequest(() => {}))
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error.code).toBe('VALIDATION_ERROR')
    },
  )
})

describe('API routes - validação de arquivo', () => {
  it('[merge] rejeita 1 arquivo (mínimo 2)', async () => {
    const res = await mergeRoute(makeRequest((fd) => fd.append('file', pdfFile())))
    expect(res.status).toBe(400)
  })

  it('[from-jpg] rejeita arquivo que não é imagem', async () => {
    const res = await fromJpgRoute(makeRequest((fd) => fd.append('file', badFile())))
    expect(res.status).toBe(400)
  })

  it.each(
    HANDLERS.filter((h) => !['merge', 'from-jpg'].includes(h.name)).map(
      (h) => [h.name, h.handler] as const,
    ),
  )('[%s] rejeita arquivo que não é PDF', async (_name, handler) => {
    const res = await handler(makeRequest((fd) => fd.set('file', badFile())))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })
})