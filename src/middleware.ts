import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const apiKey = process.env.API_SECRET_KEY
  if (apiKey) {
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (token !== apiKey) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
  }

  if (process.env.NODE_ENV !== 'production') return NextResponse.next()
  if (req.method !== 'POST') return NextResponse.next()

  const origin = req.headers.get('origin')
  if (!origin) return NextResponse.next()

  const allowedOrigin =
    process.env.ALLOWED_ORIGIN ?? `https://${req.headers.get('host')}`

  if (origin !== allowedOrigin) {
    console.warn(`[CORS] Requisição bloqueada de origem: ${origin}`)
    return NextResponse.json({ error: 'Acesso não permitido.' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/pdf/:path*',
}
