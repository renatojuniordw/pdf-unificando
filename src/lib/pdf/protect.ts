import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

const execFileAsync = promisify(execFile)

export interface ProtectOptions {
  password: string
}

export async function protectPdf(buffer: Buffer, { password }: ProtectOptions): Promise<Buffer> {
  const id = randomUUID()
  const inputPath = path.join('/tmp', `${id}-in.pdf`)
  const outputPath = path.join('/tmp', `${id}-out.pdf`)

  try {
    await writeFile(inputPath, buffer)

    await execFileAsync('gs', [
      '-dBATCH',
      '-dNOPAUSE',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dEncryptionR=3',
      '-dKeyLength=128',
      `-sOwnerPassword=${password}`,
      `-sUserPassword=${password}`,
      `-sOutputFile=${outputPath}`,
      inputPath,
    ], { timeout: 60_000 })

    return await readFile(outputPath)
  } finally {
    await Promise.allSettled([
      unlink(inputPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ])
  }
}
