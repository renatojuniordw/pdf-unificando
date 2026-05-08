import { ensurePdfHasExtractableText, extractPdfTextLines } from '@/lib/pdf/text'

export async function pdfToTxt(buffer: Buffer): Promise<Buffer> {
  const pages = await extractPdfTextLines(buffer)
  ensurePdfHasExtractableText(pages)

  return Buffer.from(buildPlainText(pages), 'utf-8')
}

function buildPlainText(pages: string[][]): string {
  return `${pages.map((lines) => lines.join('\n').trim()).join('\n\f\n').trim()}\n`
}
