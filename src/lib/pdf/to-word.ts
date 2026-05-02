import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { withTmpFile } from '@/lib/utils/tmp'

const execAsync = promisify(exec)

export async function pdfToWord(buffer: Buffer): Promise<Buffer> {
  return withTmpFile(buffer, 'pdf', 'docx', async (inputPath, outputPath) => {
    const outDir = path.dirname(outputPath)
    await execAsync(
      `libreoffice --headless --convert-to docx --outdir "${outDir}" "${inputPath}"`,
      { timeout: 90_000 }
    )
  })
}
