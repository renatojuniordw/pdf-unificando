export interface ToolDefinition {
  slug: string
  name: string
  description: string
  seoDescription: string
  /** Título de SEO (50-60 chars com o template " | Unificando PDF"); se omitido, usa `name`. */
  seoTitle?: string
  icon: string
  tier: 1 | 2 | 3
  accept: string[]
  multiple: boolean
  usesBinary: boolean
}
