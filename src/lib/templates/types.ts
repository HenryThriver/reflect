export interface ReviewTemplate {
  slug: string
  name: string
  creator: Creator
  intro: TemplateIntro
  questions: Question[]
}

export interface Creator {
  name: string
  title?: string
  avatarUrl?: string
  bio?: string
  websiteUrl?: string
}

export interface TemplateIntro {
  headline: string
  description: string
  estimatedMinutes: number
  imageUrl?: string
}

export type QuestionType = 'textarea' | 'text' | 'select' | 'scale'

export interface Question {
  id: string
  text: string
  type: QuestionType
  placeholder?: string
  helpText?: string
  required?: boolean
  options?: string[]
  minValue?: number
  maxValue?: number
  section?: string
}
