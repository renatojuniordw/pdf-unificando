/**
 * Gerenciamento de consentimento de cookies/rastreamento (LGPD — Lei 13.709/2018).
 *
 * Estado persistido em localStorage (first-party, não sensível). A preferência
 * do usuário ("accepted" | "rejected") controla o carregamento dos scripts de
 * terceiros (GA4, GTM, Meta Pixel, AdSense) via `TrackingScripts`.
 */

export type ConsentStatus = 'accepted' | 'rejected' | null

export const CONSENT_STORAGE_KEY = 'unificando-consent'

/** Evento disparado em `window` quando o usuário decide o consentimento. */
export const CONSENT_EVENT = 'unificando-consent-change'

const isBrowser = (): boolean => typeof window !== 'undefined'

export function readConsent(): ConsentStatus {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    return raw === 'accepted' || raw === 'rejected' ? raw : null
  } catch {
    // storage indisponível (modo privado/restrito) — trata como não decidido
    return null
  }
}

export function writeConsent(status: Exclude<ConsentStatus, null>): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, status)
  } catch {
    // sem storage: o estado vive apenas na sessão atual
  }
}

export function hasConsent(): boolean {
  return readConsent() === 'accepted'
}