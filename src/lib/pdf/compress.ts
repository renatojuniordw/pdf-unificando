import { exec } from 'child_process'
import { promisify } from 'util'
import { withTmpFile } from '@/lib/utils/tmp'

const execAsync = promisify(exec)

export type CompressionQuality = 
  | 'low' | 'medium' | 'high' 
  | 'screen' | 'ebook' | 'printer' | 'prepress'

const GS_QUALITY: Record<string, string> = {
  low:      '/screen',
  screen:   '/screen',
  medium:   '/ebook',
  ebook:    '/ebook',
  high:     '/printer',
  printer:  '/printer',
  prepress: '/prepress',
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
  const gsQuality = GS_QUALITY[quality] || '/ebook'

  const compressed = await withTmpFile(buffer, 'pdf', 'pdf', async (inputPath, outputPath) => {
    try {
      const { stderr } = await execAsync(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
         -dPDFSETTINGS=${gsQuality} \
         -dNOPAUSE -dQUIET -dBATCH \
         -sOutputFile="${outputPath}" "${inputPath}"`,
        { timeout: 60_000 }
      )
      
      if (stderr) {
        console.warn('[Ghostscript Warning]:', stderr)
      }
    } catch (err) {
      const e = err as { stderr?: string; message?: string }
      const msg = e.stderr || e.message
      console.error('[Ghostscript Error]:', msg)
      throw new Error(`Falha na compressão do PDF: ${msg}`)
    }
  })

  if (!compressed || compressed.byteLength === 0) {
    throw new Error('A compressão resultou em um arquivo vazio.')
  }

  return {
    buffer: compressed,
    originalSize,
    compressedSize: compressed.byteLength,
  }
}

