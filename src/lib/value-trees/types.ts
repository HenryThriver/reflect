// Value Forest types for Section 5 of Henry's Annual Review

export interface ValueTree {
  id: string
  name: string
  description?: string
  isCustom: boolean
}

export type SatisfactionScore = 1 | 2 | 3 | 4 | 5

export interface ValueTreeResponse {
  scope?: string
  standards?: string
  proudOf?: string
  gratitude?: string
  heldBack?: string
  aspiration?: string
  helpNeeded?: string
  satisfaction?: SatisfactionScore
  skipped?: boolean
}

export type ValueForestPhase = 'intro' | 'selection' | 'deep-dive' | 'ranking' | 'overview'

export interface ValueForestState {
  phase: ValueForestPhase
  selectedTreeIds: string[]
  customTrees: ValueTree[]
  currentTreeIndex: number
  currentQuestionIndex: number
  responses: Record<string, ValueTreeResponse>
  ranking: string[]
  overviewResponses: Record<string, string>
}

export interface TreeQuestion {
  id: keyof Omit<ValueTreeResponse, 'skipped'>
  text: string
  helpText?: string
  prefill?: boolean
  type?: 'textarea' | 'scale'
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
}

export interface OverviewQuestion {
  id: string
  text: string
  henryNote?: string
}
