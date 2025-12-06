import { ReviewTemplate } from './types'
import { gustinTemplate } from './gustin'
import { tiagoTemplate } from './tiago'
import { nesslabsTemplate } from './nesslabs'

export const templates: ReviewTemplate[] = [
  gustinTemplate,
  tiagoTemplate,
  nesslabsTemplate,
]

export function getTemplate(slug: string): ReviewTemplate | undefined {
  return templates.find((t) => t.slug === slug)
}

export function getAllTemplates(): ReviewTemplate[] {
  return templates
}

export { gustinTemplate, tiagoTemplate, nesslabsTemplate }
export * from './types'
