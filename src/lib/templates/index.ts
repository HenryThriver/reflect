import { ReviewTemplate } from './types'
import { gustinTemplate } from './gustin'
import { tiagoTemplate } from './tiago'
import { nesslabsTemplate } from './nesslabs'
import { henryTemplate } from './henry'
import { sahilBloomTemplate } from './sahil-bloom'
import { tkKaderTemplate } from './tk-kader'

export const templates: ReviewTemplate[] = [
  henryTemplate,
  sahilBloomTemplate,
  tkKaderTemplate,
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

export {
  gustinTemplate,
  tiagoTemplate,
  nesslabsTemplate,
  henryTemplate,
  sahilBloomTemplate,
  tkKaderTemplate,
}
export * from './types'
