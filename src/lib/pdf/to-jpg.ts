import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readdir, readFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'
import archiver from 'archiver'

const execAsync = promisify(exec)

export type JpgDpi = '72' | '150' | '300'

export async function pdfToJpg(buffer: Buffer, dpi: JpgDpi = '150'): Promise<Buffer> {
  const id = randomUUID()
  const tmpDir = `/tmp/${id}`
  const inputPath = path.join(tmpDir, 'input.pdf')

  try {
    await mkdir(tmpDir, { recursive: true })
    await writeFile(inputPath, buffer)

    await execAsync(
      `pdftoppm -jpeg -r ${dpi} "${inputPath}" "${path.join(tmpDir, 'page')}"`,
      { timeout: 120_000 }
    )

    const files = (await readdir(tmpDir))
      .filter(f => f.endsWith('.jpg'))
      .sort()

    if (files.length === 1) {
      return await readFile(path.join(tmpDir, files[0]))
    }

    return await zipFiles(tmpDir, files)
  } finally {
    await execAsync(`rm -rf "${tmpDir}"`).catch(() => {})
  }
}

async function zipFiles(dir: string, files: string[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const archive = archiver('zip', { zlib: { level: 6 } })

    archive.on('data', chunk => chunks.push(chunk))
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)

    files.forEach(f => {
      archive.file(path.join(dir, f), { name: f })
    })

    archive.finalize()
  })
}
