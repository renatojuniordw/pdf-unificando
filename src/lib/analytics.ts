'use client'

export const GA_ID = 'G-WDL8Q73DPM'

type GAEvent = {
  action: string
  category?: string
  label?: string
  value?: number
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (...args: unknown[]) => void
  }
}

export const trackEvent = ({ action, category, label, value }: GAEvent) => {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}

// Eventos específicos para ferramentas PDF
export const trackToolUpload = (tool: string, fileCount: number) => {
  trackEvent({
    action: 'tool_upload',
    category: 'tools',
    label: tool,
    value: fileCount,
  })
}

export const trackToolSuccess = (tool: string, outputSize: number) => {
  trackEvent({
    action: 'tool_success',
    category: 'tools',
    label: tool,
    value: outputSize,
  })
}

export const trackToolDownload = (tool: string, filename: string) => {
  trackEvent({
    action: 'tool_download',
    category: 'tools',
    label: `${tool}:${filename}`,
  })
}

export const trackToolError = (tool: string, errorType: string) => {
  trackEvent({
    action: 'tool_error',
    category: 'tools',
    label: `${tool}:${errorType}`,
  })
}
