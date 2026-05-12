'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { trackEvent } from '@/lib/analytics'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    trackEvent({
      action: metric.name,
      category: 'web-vitals',
      label: metric.id,
      value: Math.round(metric.value),
    })
  })

  return null
}
