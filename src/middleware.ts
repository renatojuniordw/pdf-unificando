import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next()

  const origin = req.headers.get('origin')
  const allowedOrigin = process.env.ALLOWED_ORIGIN || req.nextUrl.origin

  if (origin) {
    // Requisição de browser — bloqueia origens diferentes
    if (origin !== allowedOrigin) {
      console.warn(`[CORS] Requisição bloqueada de origem: ${origin}. Esperado: ${allowedOrigin}`)
      return NextResponse.json({ error: 'Acesso não permitido.' }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Sem Origin = chamada server-to-server (curl, outra aplicação) — exige API key
  const apiKey = process.env.API_SECRET_KEY
  if (apiKey) {
    const auth = req.headers.get('authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    if (token !== apiKey) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/pdf/:path*',
}
