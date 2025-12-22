import { ReviewTemplate } from './types'
import { gustinTemplate } from './gustin'
import { tiagoTemplate } from './tiago'
import { nesslabsTemplate } from './nesslabs'
import { henryTemplate } from './henry'
import { sahilBloomTemplate } from './sahil-bloom'
import { tkKaderTemplate } from './tk-kader'

// Module-level cache - templates are static, loaded once at startup
export const templates: ReviewTemplate[] = [
  henryTemplate,
  sahilBloomTemplate,
  tkKaderTemplate,
  gustinTemplate,
  tiagoTemplate,
  nesslabsTemplate,
]

// Map cache for O(1) lookups instead of O(n) array.find()
const templateCache = new Map<string, ReviewTemplate>(
  templates.map((t) => [t.slug, t])
)

// Pre-computed question counts for dashboard performance
const questionCountCache = new Map<string, number>(
  templates.map((t) => [t.slug, t.questions.length])
)

export function getTemplate(slug: string): ReviewTemplate | undefined {
  return templateCache.get(slug)
}

export function getTemplateQuestionCount(slug: string): number {
  return questionCountCache.get(slug) ?? 0
}

export function getAllTemplates(): ReviewTemplate[] {
  return templates
}

export {
  gustinTemplate,
  tiagoTemplate,
  nesslabsTemplate,
  henryTemplate,
  sahilBloomTemplate,
  tkKaderTemplate,
}
export * from './types'
