import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { POST as mergeRoute } from '@/app/api/pdf/merge/route'
import { POST as splitRoute } from '@/app/api/pdf/split/route'

describe('API Routes - PDF Operations', () => {
  let samplePdf: Buffer
  let multiPagePdf: Buffer

  beforeAll(() => {
    const fixtureDir = path.join(__dirname, '../../../fixtures')
    samplePdf = readFileSync(path.join(fixtureDir, 'sample.pdf'))
    multiPagePdf = readFileSync(path.join(fixtureDir, 'multi-page.pdf'))
  })

  describe('POST /api/pdf/merge', () => {
    it('deve retornar 400 se nenhum arquivo enviado', async () => {
      const formData = new FormData()
      const req = new Request('http://localhost/api/pdf/merge', {
        method: 'POST',
        body: formData,
      })

      const res = await mergeRoute(req as any)
      expect(res.status).toBe(400)
    })

    it('deve retornar 400 se apenas um arquivo enviado', async () => {
      const formData = new FormData()
      formData.append('file', new Blob([samplePdf]), 'test.pdf')

      const req = new Request('http://localhost/api/pdf/merge', {
        method: 'POST',
        body: formData,
      })

      const res = await mergeRoute(req as any)
      expect(res.status).toBe(400)
    })

    it('deve retornar 200 com PDF válido para dois arquivos', async () => {
      const formData = new FormData()
      formData.append('file', new Blob([samplePdf]), 'test1.pdf')
      formData.append('file', new Blob([samplePdf]), 'test2.pdf')

      const req = new Request('http://localhost/api/pdf/merge', {
        method: 'POST',
        body: formData,
      })

      const res = await mergeRoute(req as any)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('application/pdf')
      expect(res.headers.get('content-disposition')).toContain('unificado.pdf')
    })
  })

  describe('POST /api/pdf/split', () => {
    it('deve retornar 400 se nenhum arquivo enviado', async () => {
      const formData = new FormData()
      formData.append('pages', '1-2')

      const req = new Request('http://localhost/api/pdf/split', {
        method: 'POST',
        body: formData,
      })

      const res = await splitRoute(req as any)
      expect(res.status).toBe(400)
    })

    it('deve retornar 400 se intervalo não informado', async () => {
      const formData = new FormData()
      formData.append('file', new Blob([multiPagePdf]), 'test.pdf')

      const req = new Request('http://localhost/api/pdf/split', {
        method: 'POST',
        body: formData,
      })

      const res = await splitRoute(req as any)
      expect(res.status).toBe(400)
    })

    it('deve retornar 200 com intervalo válido', async () => {
      const formData = new FormData()
      formData.append('file', new Blob([multiPagePdf]), 'test.pdf')
      formData.append('pages', '1-2')

      const req = new Request('http://localhost/api/pdf/split', {
        method: 'POST',
        body: formData,
      })

      const res = await splitRoute(req as any)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('application/pdf')
      expect(res.headers.get('content-disposition')).toContain('dividido.pdf')
    })
  })
})
