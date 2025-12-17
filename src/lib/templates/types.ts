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

/**
 * Question Text Convention:
 *
 * - `text`: The main question (bold, large font). Can contain multiple paragraphs
 *   separated by `\n\n` - first paragraph stays bold, subsequent paragraphs render
 *   as muted subhead style.
 *
 * - `subhead`: Optional explanatory text that appears after the question text.
 *   Rendered in muted color, slightly smaller than the main question.
 *   Use this for context, framing, or attribution (e.g., "Richard Feynman kept...").
 *   Preferred over embedding in `text` with `\n\n` when the subhead is clearly
 *   separate content (not a continuation of the question).
 *
 * - `helpText`: Smaller helper text below the subhead. Use for instructions,
 *   tips, or examples that help the user answer. Rendered in base text size.
 *
 * - `henryNote`: Personal note from Henry - a distinct "author's voice" that shares
 *   personal experience or tips. Rendered with special styling (italic blockquote
 *   with "- H" signature) to feel like a friend's annotation in the margin.
 *   Use sparingly for moments where personal experience adds genuine value.
 *
 * Rendering order: text → subhead → helpText → henryNote → input
 */
export interface Question {
  id: string
  text: string
  subhead?: string
  type: QuestionType
  placeholder?: string
  helpText?: string
  henryNote?: string
  required?: boolean
  options?: string[]
  minValue?: number
  maxValue?: number
  section?: string
}
