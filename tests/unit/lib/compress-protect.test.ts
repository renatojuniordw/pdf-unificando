import { describe, expect, it, vi, beforeEach } from 'vitest'

const execFile = vi.hoisted(() => vi.fn())
const tmpState = vi.hoisted(() => ({
  readFile: vi.fn(async () => Buffer.from('%PDF mock')),
  writeFile: vi.fn(async () => undefined),
  unlink: vi.fn(async () => undefined),
  withTmpFileResult: Buffer.from('%PDF compressed'),
}))

vi.mock('child_process', () => ({
  execFile,
}))

vi.mock('fs/promises', () => ({
  readFile: tmpState.readFile,
  writeFile: tmpState.writeFile,
  unlink: tmpState.unlink,
}))

vi.mock('@/lib/utils/tmp', () => ({
  withTmpFile: vi.fn(async (_buffer: Buffer, _inputExt: string, _outputExt: string, fn: (inputPath: string, outputPath: string) => Promise<void>) => {
    await fn('/tmp/input.pdf', '/tmp/output.pdf')
    return tmpState.withTmpFileResult
  }),
}))

vi.mock('crypto', async () => {
  const actual = await vi.importActual<typeof import('crypto')>('crypto')
  return {
    ...actual,
    randomUUID: () => 'uuid-mock',
  }
})

import { compressPdf } from '@/lib/pdf/compress'
import { protectPdf } from '@/lib/pdf/protect'

describe('compress e protect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve comprimir e reportar tamanhos', async () => {
    execFile.mockImplementation((...args: unknown[]) => {
      const cb = args.at(-1) as (err: null, stdout: string, stderr: string) => void
      cb(null, '', '')
    })

    const input = Buffer.from('%PDF-1.4')
    const result = await compressPdf(input, 'high')

    expect(result.originalSize).toBe(input.byteLength)
    expect(result.compressedSize).toBeGreaterThan(0)
    expect(execFile).toHaveBeenCalled()
  })

  it('deve lançar quando o resultado da compressão vem vazio', async () => {
    tmpState.withTmpFileResult = Buffer.alloc(0)
    await expect(compressPdf(Buffer.from('%PDF-1.4'))).rejects.toMatchObject({ status: 500 })
    tmpState.withTmpFileResult = Buffer.from('%PDF compressed')
  })

  it('deve propagar falha do ghostscript', async () => {
    execFile.mockImplementation((...args: unknown[]) => {
      const cb = args.at(-1) as (err: Error & { stderr?: string }) => void
      cb(Object.assign(new Error('ghostscript failed'), { stderr: 'broken' }))
    })

    await expect(compressPdf(Buffer.from('%PDF-1.4'))).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })

  it('deve proteger e limpar temporários', async () => {
    execFile.mockImplementation((...args: unknown[]) => {
      const cb = args.at(-1) as (err: null, stdout: string, stderr: string) => void
      cb(null, '', '')
    })

    const result = await protectPdf(Buffer.from('PDF'), { password: 'secret' })
    expect(result).toBeInstanceOf(Buffer)
    expect(tmpState.writeFile).toHaveBeenCalled()
    expect(tmpState.readFile).toHaveBeenCalled()
    expect(tmpState.unlink).toHaveBeenCalled()
  })
})
