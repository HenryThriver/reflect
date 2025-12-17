import type { ValueTree, TreeQuestion, OverviewQuestion } from './types'

export const DEFAULT_TREES: ValueTree[] = [
  { id: 'health-body', name: 'Health & Body', description: 'Physical health, fitness, energy, nutrition, sleep', isCustom: false },
  { id: 'career-work', name: 'Career & Work', description: 'Job, professional development, business, impact', isCustom: false },
  { id: 'finances', name: 'Finances', description: 'Income, savings, investments, financial security', isCustom: false },
  { id: 'partnership', name: 'Partnership', description: 'Romantic relationship, marriage, significant other', isCustom: false },
  { id: 'family', name: 'Family', description: 'Parents, siblings, extended family, chosen family', isCustom: false },
  { id: 'friendships-community', name: 'Friendships & Community', description: 'Social connections, meaningful relationships, belonging', isCustom: false },
  { id: 'home-environment', name: 'Home & Environment', description: 'Physical space, where you live, your sanctuary', isCustom: false },
  { id: 'learning-intellect', name: 'Learning & Intellect', description: 'Reading, studying, skill development, curiosity', isCustom: false },
  { id: 'creativity-play', name: 'Creativity & Play', description: 'Hobbies, creative expression, fun, leisure', isCustom: false },
  { id: 'spirituality-meaning', name: 'Spirituality & Meaning', description: 'Inner life, purpose, faith, practices, presence', isCustom: false },
  { id: 'giving-service', name: 'Giving & Service', description: 'Contribution, volunteering, mentoring, social impact', isCustom: false },
  { id: 'experiences-adventure', name: 'Experiences & Adventure', description: 'Travel, culture, new experiences, exploration', isCustom: false },
  { id: 'parenthood', name: 'Parenthood', description: 'Children, caregiving, parenting', isCustom: false },
]

export const PRE_SELECTED_IDS = [
  'health-body',
  'career-work',
  'finances',
  'family',
  'friendships-community',
  'learning-intellect',
]

export const TREE_QUESTIONS: TreeQuestion[] = [
  {
    id: 'scope',
    text: '🌱 Roots: What scope does [TREE] encompass for you?\n\nWhat falls inside and outside its boundaries?',
    prefill: true
  },
  {
    id: 'standards',
    text: '🪵 Trunk: How do you want to show up in [TREE]?\n\nWhat principles or values guide your behavior here?'
  },
  {
    id: 'proudOf',
    text: '🌿 Branches: What are you most proud of in [TREE] this year?\n\nWhat growth or progress happened here?'
  },
  {
    id: 'gratitude',
    text: '🍃 Leaves: What moments, milestones, or mentors were impactful for you in [TREE]?\n\nWho or what are you grateful for in this area?'
  },
  {
    id: 'heldBack',
    text: 'What held you back in [TREE] this year?\n\nWhat fears or obstacles got in the way of what you hoped for?'
  },
  {
    id: 'aspiration',
    text: 'What do you want for [TREE] next year?\n\nWhat outcomes, ways of being, or changes are you aspiring to?'
  },
  {
    id: 'helpNeeded',
    text: 'Who or what could help you with [TREE]?\n\nIs there anyone you know who has succeeded doing something similar?'
  },
  {
    id: 'satisfaction',
    text: 'How satisfied are you with [TREE] right now?',
    type: 'scale',
    min: 1,
    max: 5,
    minLabel: 'Extremely frustrated',
    maxLabel: 'Extremely pleased'
  },
]

export const OVERVIEW_QUESTIONS: OverviewQuestion[] = [
  {
    id: 'gap',
    text: 'Looking at your forest, where is the biggest gap between where you are and where you want to be?'
  },
  {
    id: 'shifts',
    text: "Are there any Value Trees that have shifted in importance this year?\n\nSomething that used to matter that doesn't anymore, or something newly important?",
    henryNote: "Over the years, my top 5 trees have varied in ways that surprise me. What's most important to me right now is both rigidly fixed and constantly evolving."
  },
  {
    id: 'interdependencies',
    text: 'How do your different Value Trees affect each other?\n\nWhere does progress in one area support another? Where do they compete for your time and energy?'
  },
]

export function generateCustomTreeId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
  return `custom-${slug}-${Date.now()}`
}

export function getDefaultForestState(): ValueForestState {
  return {
    phase: 'intro',
    selectedTreeIds: [...PRE_SELECTED_IDS],
    customTrees: [],
    currentTreeIndex: 0,
    currentQuestionIndex: 0,
    responses: {},
    ranking: [],
    overviewResponses: {},
  }
}

// Re-export ValueForestState for convenience
import type { ValueForestState } from './types'
export type { ValueForestState }
