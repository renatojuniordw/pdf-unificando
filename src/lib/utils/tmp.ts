import { writeFile, readFile, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

const TMP_DIR = '/tmp'

export async function withTmpFile(
  buffer: Buffer,
  inputExt: string,
  outputExt: string,
  fn: (inputPath: string, outputPath: string) => Promise<void>
): Promise<Buffer> {
  const inputPath = path.join(TMP_DIR, `${randomUUID()}.${inputExt}`)
  const outputPath = path.join(TMP_DIR, `${randomUUID()}.${outputExt}`)

  try {
    await writeFile(inputPath, buffer)
    await fn(inputPath, outputPath)
    return await readFile(outputPath)
  } finally {
    await Promise.allSettled([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ])
  }
}
