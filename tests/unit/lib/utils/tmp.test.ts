import { readFile, writeFile } from 'fs/promises'
import { describe, expect, it } from 'vitest'
import { withTmpFile } from '@/lib/utils/tmp'

describe('lib/utils/tmp', () => {
  it('deve usar caminhos temporarios distintos quando entrada e saida tem a mesma extensao', async () => {
    const input = Buffer.from('conteudo de teste')

    const result = await withTmpFile(input, 'pdf', 'pdf', async (inputPath, outputPath) => {
      expect(inputPath).not.toBe(outputPath)
      expect(inputPath.endsWith('.input.pdf')).toBe(true)
      expect(outputPath.endsWith('.output.pdf')).toBe(true)

      const source = await readFile(inputPath)
      expect(source.equals(input)).toBe(true)
      await writeFile(outputPath, source)
    })

    expect(result.equals(input)).toBe(true)
  })
})
