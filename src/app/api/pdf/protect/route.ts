import { type NextRequest } from 'next/server'
import { protectPdf } from '@/lib/pdf/protect'
import { binaryLimit, validateRateLimit } from '@/lib/queue'
import { buildOutputFilename, errorResponse, parseSinglePdfUpload, requireFormField, streamResponse } from '@/lib/utils/http'

export async function POST(req: NextRequest) {
  try {
    validateRateLimit(req)
    const { formData, buffer, fileName } = await parseSinglePdfUpload(req)
    const password = requireFormField(formData, 'password', 'Senha não informada.', 'missing_password', {
      trim: true,
      maxLength: 128,
      maxMessage: 'Senha muito longa.',
    })

    const result = await binaryLimit(() => protectPdf(buffer, { password }))

    return streamResponse(result, buildOutputFilename(fileName, 'pdf'), 'application/pdf')
  } catch (err) {
    return errorResponse(err)
  }
}
