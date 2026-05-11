import { tools } from '@/config/tools'
import { ToolCard } from './ToolCard'

export function ToolGrid() {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 list-none p-0">
      {tools.map(tool => (
        <li key={tool.slug} className="transition-transform hover:-translate-y-1">
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  )
}
