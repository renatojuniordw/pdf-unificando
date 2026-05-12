export const SITE_URL = process.env.SITE_URL ?? 'https://pdf.unificando.com.br'

export function siteUrl(path = ''): string {
  return new URL(path || '/', SITE_URL).toString()
}
