export type ProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'done'
  | 'error'
  | 'rate_limited'

export interface ProcessedFile {
  url: string
  name: string
  size: number
}

export interface PdfApiError {
  error: string
}
