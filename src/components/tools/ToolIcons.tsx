import React from 'react'

export const TOOL_ICONS: Record<string, (size: number) => React.ReactNode> = {
  compress: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M16 4v10M10 10l6-6 6 6M16 28v-10M10 22l6 6 6-6" />
    </svg>
  ),
  merge: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="10" height="14" />
      <rect x="18" y="4" width="10" height="14" />
      <path d="M9 18v4h14v-4M16 22v6" />
    </svg>
  ),
  split: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="24" height="14" />
      <line x1="4" y1="24" x2="28" y2="24" strokeDasharray="3,2" />
      <path d="M9 28h6M17 28h6" />
    </svg>
  ),
  'extract-pages': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="11" height="16" />
      <rect x="17" y="12" width="11" height="16" />
      <path d="M16 8h6M19 5l-3 3 3 3" />
    </svg>
  ),
  'pdf-to-word': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="18" />
      <path d="M22 10l6 6-6 6M18 16h10" />
    </svg>
  ),
  'pdf-to-txt': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="18" />
      <path d="M20 10h8M24 10v12M21 22h6" />
    </svg>
  ),
  'pdf-to-jpg': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="18" />
      <rect x="16" y="12" width="12" height="16" />
      <path d="M19 18l2 2 4-4" />
    </svg>
  ),
  'jpg-to-pdf': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="16" />
      <rect x="14" y="12" width="14" height="16" />
      <path d="M14 8l6 6-6 6" />
    </svg>
  ),
  rotate: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M26 16a10 10 0 1 1-3-7" />
      <path d="M26 6v7h-7" />
    </svg>
  ),
  organize: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="8" height="10" />
      <rect x="14" y="4" width="8" height="10" />
      <rect x="24" y="4" width="4" height="10" />
      <line x1="4" y1="20" x2="28" y2="20" />
      <line x1="4" y1="26" x2="20" y2="26" />
    </svg>
  ),
  protect: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="8" y="14" width="16" height="14" />
      <path d="M11 14v-4a5 5 0 0 1 10 0v4" />
      <line x1="16" y1="20" x2="16" y2="22" />
    </svg>
  ),
  watermark: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="16" height="20" />
      <line x1="10" y1="24" x2="28" y2="8" strokeDasharray="3,2" />
      <line x1="14" y1="28" x2="28" y2="14" strokeDasharray="3,2" />
    </svg>
  ),
  'page-numbers': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="18" height="24" />
      <line x1="9" y1="9" x2="17" y2="9" />
      <line x1="9" y1="23" x2="17" y2="23" />
      <path d="M25 10v10M23 12l2-2 2 2M23 18l2 2 2-2" />
    </svg>
  ),
  'pdf-to-png': (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="14" height="18" />
      <rect x="16" y="12" width="12" height="16" strokeDasharray="3,2" />
      <path d="M19 20l2 2 4-4" />
    </svg>
  ),
  redact: (size) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <rect x="4" y="4" width="24" height="24" />
      <rect x="8" y="12" width="16" height="4" fill="currentColor" stroke="none" />
      <rect x="8" y="20" width="10" height="4" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export function getToolIcon(iconName: string, size = 24) {
  const iconFn = TOOL_ICONS[iconName]
  if (!iconFn) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
        <rect x="4" y="4" width="24" height="24" />
      </svg>
    )
  }
  
  return iconFn(size)
}
