import { exec } from 'child_process'
import { promisify } from 'util'
import { withTmpFile } from '@/lib/utils/tmp'

const execAsync = promisify(exec)

export type CompressionQuality = 'low' | 'medium' | 'high'

const GS_QUALITY: Record<CompressionQuality, string> = {
  low:    '/screen',
  medium: '/ebook',
  high:   '/printer',
}

export interface CompressResult {
  buffer: Buffer
  originalSize: number
  compressedSize: number
}

export async function compressPdf(
  buffer: Buffer,
  quality: CompressionQuality = 'medium'
): Promise<CompressResult> {
  const originalSize = buffer.byteLength

  const compressed = await withTmpFile(buffer, 'pdf', 'pdf', async (inputPath, outputPath) => {
    await execAsync(
      `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
       -dPDFSETTINGS=${GS_QUALITY[quality]} \
       -dNOPAUSE -dQUIET -dBATCH \
       -sOutputFile="${outputPath}" "${inputPath}"`,
      { timeout: 60_000 }
    )
  })

  return {
    buffer: compressed,
    originalSize,
    compressedSize: compressed.byteLength,
  }
}
