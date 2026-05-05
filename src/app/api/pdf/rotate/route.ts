import { type NextRequest } from 'next/server'
import { rotatePdf, type RotationDegrees, type RotationScope } from '@/lib/pdf/rotate'
import { buildOutputFilename, errorResponse, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const deg = Number(formData.get('degrees') ?? 90) as RotationDegrees
    const scope = (formData.get('scope') as RotationScope) ?? 'all'
    const page = formData.get('page') ? Number(formData.get('page')) - 1 : undefined

    const result = await rotatePdf(buffer, deg, scope, page)
    return streamResponse(result, buildOutputFilename(file.name, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
