export interface ToolDefinition {
  slug: string
  name: string
  description: string
  seoDescription: string
  icon: string
  tier: 1 | 2 | 3
  accept: string[]
  multiple: boolean
  usesBinary: boolean
}
