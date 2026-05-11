import { PDFDocument, degrees } from 'pdf-lib'
import { createApiError } from '@/lib/utils/http'

export type RotationDegrees = 90 | 180 | 270
export type RotationScope = 'all' | 'page'

export async function rotatePdf(
  buffer: Buffer,
  deg: RotationDegrees,
  scope: RotationScope,
  pageIndex?: number
): Promise<Buffer> {
  if (deg !== 90 && deg !== 180 && deg !== 270) {
    throw createApiError(400, 'VALIDATION_ERROR', 'Ângulo de rotação inválido.', {
      field: 'degrees',
      reason: 'invalid_degrees',
    })
  }
  if (scope !== 'all' && scope !== 'page') {
    throw createApiError(400, 'VALIDATION_ERROR', 'Escopo de rotação inválido.', {
      field: 'scope',
      reason: 'invalid_scope',
    })
  }

  const doc = await PDFDocument.load(buffer)
  const pages = doc.getPages()

  if (scope === 'all') {
    pages.forEach(p => {
      const current = p.getRotation().angle
      p.setRotation(degrees((current + deg) % 360))
    })
  } else {
    if (pageIndex === undefined) {
      throw createApiError(400, 'VALIDATION_ERROR', 'Página não informada.', {
        field: 'page',
        reason: 'missing_page',
      })
    }

    const page = pages[pageIndex]
    if (!page) {
      throw createApiError(404, 'NOT_FOUND', 'Página não encontrada.', {
        field: 'page',
        reason: 'page_not_found',
      })
    }
    const current = page.getRotation().angle
    page.setRotation(degrees((current + deg) % 360))
  }

  const bytes = await doc.save()
  return Buffer.from(bytes)
}
