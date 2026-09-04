import { describe, expect, it } from 'vitest'
import {
  apiErrorResponse,
  assertMaxFileCount,
  assertMaxFileSize,
  buildOutputFilename,
  createApiError,
  isJpg,
  isPdf,
  isPng,
  parseFormData,
  parseImageUploads,
  parsePdfUploads,
  parseSinglePdfUpload,
  readFormFile,
  readFormFiles,
  requireFormField,
  streamResponse,
  validateHoneypot,
} from '@/lib/utils/http'

describe('lib/utils/http', () => {
  it('deve criar envelopes de erro padronizados', async () => {
    const res = apiErrorResponse(400, 'VALIDATION_ERROR', 'Falha', { field: 'file' }, false, {
      'Retry-After': '30',
    })

    expect(res.status).toBe(400)
    expect(res.headers.get('Retry-After')).toBe('30')

    const body = await res.json()
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Falha',
        details: { field: 'file' },
        retryable: false,
      },
    })
  })

  it('deve criar erros tipados para o backend', () => {
    const err = createApiError(413, 'VALIDATION_ERROR', 'Arquivo grande demais')
    expect(err.status).toBe(413)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.message).toBe('Arquivo grande demais')
  })

  it('deve validar limites de arquivo e quantidade', () => {
    expect(() => assertMaxFileSize({ name: 'a.pdf', size: 10 }, 5)).toThrow(/muito grande/i)
    expect(() => assertMaxFileCount(3, 2)).toThrow(/Muitos arquivos enviados/i)
  })

  it('deve identificar magic bytes comuns e validar honeypot', () => {
    expect(isPdf(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe(true)
    expect(isJpg(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe(true)
    expect(isPng(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true)

    const fd = new FormData()
    expect(validateHoneypot(fd)).toBe(true)
    fd.set('_hp', '')
    expect(validateHoneypot(fd)).toBe(true)
    fd.set('_hp', 'bot')
    expect(validateHoneypot(fd)).toBe(false)
  })

  it('deve montar nome de saída seguro', () => {
    expect(buildOutputFilename('Árvore 2025.final.pdf', 'png')).toBe('Arvore_2025_final_unificando.png')
    expect(buildOutputFilename('arquivo-com-extensão.pdf', 'zip')).toBe('arquivo_com_extensao_unificando.zip')
  })

  it('deve streamar bytes com headers de download', async () => {
    const res = streamResponse(Buffer.from('abc'), 'saida.pdf', 'application/pdf')

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="saida.pdf"')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('deve ler um arquivo único do FormData', async () => {
    const fd = new FormData()
    fd.set('file', new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'sample.pdf'))
    const req = new Request('http://localhost/api/test', { method: 'POST', body: fd })

    const buffer = await readFormFile(req)
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-')
  })

  it('deve ler múltiplos arquivos válidos do FormData', async () => {
    const fd = new FormData()
    fd.append('file', new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'sample.pdf'))
    fd.append('file', new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'img.png'))
    const req = new Request('http://localhost/api/test', { method: 'POST', body: fd })

    const buffers = await readFormFiles(req)
    expect(buffers).toHaveLength(2)
  })

  it('deve rejeitar arquivos inválidos', async () => {
    const fd = new FormData()
    fd.set('file', new File([Uint8Array.from([1, 2, 3])], 'sample.pdf'))
    const req = new Request('http://localhost/api/test', { method: 'POST', body: fd })

    await expect(readFormFile(req)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })
  })
})

describe('parseFormData / parseSinglePdfUpload', () => {
  const pdfBytes = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
  const makeReq = (fd: FormData) =>
    new Request('http://localhost/api/test', { method: 'POST', body: fd })

  it('deve rejeitar honeypot disparado no parse', async () => {
    const fd = new FormData()
    fd.set('_hp', 'bot')
    await expect(parseSinglePdfUpload(makeReq(fd))).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })
    await expect(parseFormData(makeReq(fd))).rejects.toMatchObject({ status: 400 })
  })

  it('deve rejeitar upload sem arquivo', async () => {
    await expect(parseSinglePdfUpload(makeReq(new FormData()))).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      details: { reason: 'missing_file' },
    })
  })

  it('deve rejeitar arquivo que não é PDF', async () => {
    const fd = new FormData()
    fd.set('file', new File([Uint8Array.from([1, 2, 3])], 'x.pdf'))
    await expect(parseSinglePdfUpload(makeReq(fd))).rejects.toMatchObject({ status: 400 })
  })

  it('deve devolver formData, buffer e fileName para PDF válido', async () => {
    const fd = new FormData()
    fd.set('file', new File([pdfBytes], 'sample.pdf'))
    fd.set('quality', 'ebook')
    const { formData, buffer, fileName } = await parseSinglePdfUpload(makeReq(fd))
    expect(fileName).toBe('sample.pdf')
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-')
    expect(formData.get('quality')).toBe('ebook')
  })
})

describe('parsePdfUploads / parseImageUploads', () => {
  const makeReq = (fd: FormData) =>
    new Request('http://localhost/api/test', { method: 'POST', body: fd })

  it('deve exigir a quantidade mínima de arquivos', async () => {
    const fd = new FormData()
    fd.set('file', new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46])], 'a.pdf'))
    await expect(parsePdfUploads(makeReq(fd), 2)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })
  })

  it('deve ler múltiplos PDFs válidos', async () => {
    const fd = new FormData()
    fd.append('file', new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'a.pdf'))
    fd.append('file', new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])], 'b.pdf'))
    const { buffers, fileNames } = await parsePdfUploads(makeReq(fd))
    expect(buffers).toHaveLength(2)
    expect(fileNames).toEqual(['a.pdf', 'b.pdf'])
  })

  it('deve rejeitar quando um dos PDFs é inválido', async () => {
    const fd = new FormData()
    fd.append('file', new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46])], 'a.pdf'))
    fd.append('file', new File([Uint8Array.from([1, 2, 3])], 'b.pdf'))
    await expect(parsePdfUploads(makeReq(fd))).rejects.toMatchObject({ status: 400 })
  })

  it('deve rejeitar imagem que não é JPG/PNG', async () => {
    const fd = new FormData()
    fd.set('file', new File([Uint8Array.from([1, 2, 3])], 'img.png'))
    await expect(parseImageUploads(makeReq(fd))).rejects.toMatchObject({ status: 400 })
  })

  it('deve ler imagens JPG/PNG válidas', async () => {
    const fd = new FormData()
    fd.append('file', new File([Uint8Array.from([0xff, 0xd8, 0xff, 0x00])], 'a.jpg'))
    fd.append('file', new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'b.png'))
    const { buffers } = await parseImageUploads(makeReq(fd))
    expect(buffers).toHaveLength(2)
  })
})

describe('requireFormField', () => {
  it('deve lançar quando o campo está ausente ou vazio', () => {
    const fd = new FormData()
    expect(() => requireFormField(fd, 'range', 'Informe o intervalo.', 'missing_range')).toThrow(
      /Informe o intervalo/,
    )
    fd.set('range', '')
    expect(() => requireFormField(fd, 'range', 'Informe o intervalo.', 'missing_range')).toThrow(
      /Informe o intervalo/,
    )
    fd.set('range', '   ')
    expect(() =>
      requireFormField(fd, 'range', 'Informe o intervalo.', 'missing_range', { trim: true }),
    ).toThrow(/Informe o intervalo/)
  })

  it('deve devolver o valor quando preenchido', () => {
    const fd = new FormData()
    fd.set('range', '1-3')
    expect(requireFormField(fd, 'range', 'Informe o intervalo.', 'missing_range')).toBe('1-3')
  })

  it('deve aplicar trim e limite de comprimento', () => {
    const fd = new FormData()
    fd.set('text', '  olá  ')
    expect(requireFormField(fd, 'text', 'Texto obrigatório.', 'missing_text', { trim: true })).toBe(
      'olá',
    )
    fd.set('text', 'a'.repeat(101))
    expect(() =>
      requireFormField(fd, 'text', 'Texto obrigatório.', 'missing_text', {
        trim: true,
        maxLength: 100,
        maxMessage: 'Texto muito longo.',
      }),
    ).toThrow('Texto muito longo.')
  })
})
