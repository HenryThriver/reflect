# Value Trees Interface Implementation Plan (Revised)

## Overview

The Value Forest is Section 5 of Henry's Annual Review. Users:
1. **Select** which Value Trees apply to them (13 defaults + custom)
2. **Deep-dive** into each selected tree (8 questions per tree)
3. **Rank** trees by priority
4. **View** a summary table + answer 3 reflection questions

## Key Decisions

| Decision | Answer |
|----------|--------|
| Quick mode | No |
| Intro screen | Skip for now (can add later) |
| Custom trees | Yes, from the start |
| Ranking UI | ↑↓ buttons first (drag-and-drop later) |
| Overview insights | Simple table only, no auto-calculations |
| Skip functionality | Can skip any question or entire tree |
| Progress bar | Show % complete within Value Forest section |

---

## Simplified Architecture

Based on reviewer feedback, we're simplifying from 6 components to 3:

```
src/components/review/value-trees/
├── tree-selection.tsx      # Checkbox selection + custom tree modal
├── tree-deep-dive.tsx      # Per-tree questions (reuses TypeformQuestion patterns)
├── tree-ranking.tsx        # ↑↓ reordering
└── forest-overview.tsx     # Summary table + 3 reflection questions
```

No separate "orchestrator" - the main `review-flow.tsx` handles phase transitions.

---

## Data Structures

### Types (extend existing `src/lib/templates/types.ts`)

```typescript
export interface ValueTree {
  id: string
  name: string
  description?: string  // Optional for custom trees
  isCustom: boolean
}

export type SatisfactionScore = 1 | 2 | 3 | 4 | 5

export interface ValueTreeResponse {
  scope: string
  standards: string
  proudOf: string
  gratitude: string
  heldBack: string
  aspiration: string
  helpNeeded: string
  satisfaction?: SatisfactionScore  // Optional if skipped
  skipped?: boolean
}

export type ValueForestPhase = 'selection' | 'deep-dive' | 'ranking' | 'overview'

export interface ValueForestState {
  phase: ValueForestPhase
  selectedTreeIds: string[]
  customTrees: ValueTree[]
  currentTreeIndex: number
  currentQuestionIndex: number  // 0-7 within current tree
  responses: Record<string, ValueTreeResponse>  // keyed by tree ID
  ranking: string[]  // ordered tree IDs
}
```

### Storage (extend `guest-storage.ts`)

```typescript
export interface GuestReview {
  // ...existing fields
  valueForest?: ValueForestState
}
```

Use flat key-value responses for individual questions:
- `forest-health-scope`: "Physical health..."
- `forest-health-standards`: "I want to..."
- `forest-ranking`: "health,career,family"

---

## Constants

```typescript
// src/lib/value-trees/constants.ts

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

export const TREE_QUESTIONS = [
  { id: 'scope', text: 'What does [TREE] encompass for you?', helpText: 'Define the scope of this life area', prefill: true },
  { id: 'standards', text: 'How do you want to show up in [TREE]? What principles guide you here?' },
  { id: 'proudOf', text: 'What are you most proud of in [TREE] this year?' },
  { id: 'gratitude', text: 'Who supported you or showed up for you here? What are you grateful for in this area?' },
  { id: 'heldBack', text: 'What held you back or didn\'t go the way you hoped? What fears or obstacles got in the way?' },
  { id: 'aspiration', text: 'What do you want next year? What outcomes, ways of being, or changes are you aspiring to?' },
  { id: 'helpNeeded', text: 'Who or what could help you with this? Is there anyone you know who has succeeded doing something similar?' },
  { id: 'satisfaction', text: 'How satisfied are you with [TREE] right now?', type: 'scale', min: 1, max: 5 },
]

export const OVERVIEW_QUESTIONS = [
  { id: 'gap', text: 'Looking at your forest, where is the biggest gap between where you are and where you want to be?' },
  { id: 'shifts', text: 'Are there any Value Trees that have shifted in importance this year? Something that used to matter that doesn\'t anymore, or something newly important?' },
  { id: 'interdependencies', text: 'How do your different Value Trees affect each other? Where does progress in one area support another? Where do they compete for your time and energy?' },
]
```

---

## Component Specs

### 1. TreeSelection

**File:** `src/components/review/value-trees/tree-selection.tsx`

**Features:**
- Checkbox list of 13 default trees (6 pre-selected)
- Description shown under each tree name
- Counter: "You've selected X trees"
- "+ Add custom tree" button
- Custom tree modal (name required, description optional)
- Custom trees appear at bottom, auto-selected
- "Continue" button

**Props:**
```typescript
interface TreeSelectionProps {
  selectedIds: string[]
  customTrees: ValueTree[]
  onSelectionChange: (ids: string[]) => void
  onAddCustomTree: (name: string, description?: string) => void
  onContinue: () => void
}
```

**Custom Tree ID Generation:**
```typescript
function generateCustomTreeId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
  return `custom-${slug}-${Date.now()}`
}
```

---

### 2. TreeDeepDive

**File:** `src/components/review/value-trees/tree-deep-dive.tsx`

**Features:**
- Shows one question at a time (TypeformQuestion style)
- 8 questions per tree
- Progress: "Tree 3 of 8: Finances" + "Question 2 of 8"
- "Skip question" option (question is optional)
- "Skip tree" option (skips remaining questions for this tree)
- Pre-fills scope question with tree description
- After question 8, advances to next tree (or ranking if last tree)

**Props:**
```typescript
interface TreeDeepDiveProps {
  tree: ValueTree
  treeIndex: number
  totalTrees: number
  questionIndex: number
  existingValue?: string
  mode: 'digital' | 'handwriting'
  onAnswer: (questionId: string, value: string) => void
  onNext: () => void
  onPrevious: () => void
  onSkipQuestion: () => void
  onSkipTree: () => void
}
```

---

### 3. TreeRanking

**File:** `src/components/review/value-trees/tree-ranking.tsx`

**Features:**
- List of selected trees with ↑↓ buttons
- Numbered positions (1, 2, 3...)
- Shows tree name + satisfaction score (if answered)
- "Continue" button

**Props:**
```typescript
interface TreeRankingProps {
  trees: ValueTree[]
  responses: Record<string, ValueTreeResponse>
  ranking: string[]
  onRankingChange: (newRanking: string[]) => void
  onContinue: () => void
  onBack: () => void
}
```

**Ranking Logic:**
```typescript
function moveUp(ranking: string[], index: number): string[] {
  if (index === 0) return ranking
  const newRanking = [...ranking]
  ;[newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]]
  return newRanking
}

function moveDown(ranking: string[], index: number): string[] {
  if (index === ranking.length - 1) return ranking
  const newRanking = [...ranking]
  ;[newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]]
  return newRanking
}
```

---

### 4. ForestOverview

**File:** `src/components/review/value-trees/forest-overview.tsx`

**Features:**
- Summary table showing: Rank | Tree Name | Satisfaction
- Satisfaction displayed as dots: ●●●○○
- No auto-generated insights (user draws own conclusions)
- 3 reflection questions (textarea, TypeformQuestion style)

**Props:**
```typescript
interface ForestOverviewProps {
  trees: ValueTree[]
  responses: Record<string, ValueTreeResponse>
  ranking: string[]
  overviewResponses: Record<string, string>
  currentQuestionIndex: number
  onAnswer: (questionId: string, value: string) => void
  onNext: () => void
  onPrevious: () => void
  onComplete: () => void
}
```

**Table Display:**
```
YOUR VALUE FOREST

Rank    Tree                      Satisfaction
────────────────────────────────────────────────
1       Career & Work             ●●●○○
2       Health & Body             ●●○○○
3       Family                    ●●●●○
...
```

---

## Integration with Review Flow

### Option: Section Detection

In `review-flow.tsx`, detect when entering Section 5:

```typescript
// When currentQuestion.section === 'Section 5: Value Forest'
// Render <ValueForestSection> instead of <TypeformQuestion>

if (currentQuestion.section?.includes('Value Forest')) {
  return (
    <ValueForestSection
      templateSlug={template.slug}
      mode={reviewMode}
      onComplete={handleValueForestComplete}
    />
  )
}
```

### ValueForestSection Component

A thin wrapper that:
1. Loads/saves state from localStorage via `guest-storage.ts`
2. Tracks current phase (selection → deep-dive → ranking → overview)
3. Renders the appropriate sub-component
4. Calls `onComplete` when all phases done

```typescript
function ValueForestSection({ templateSlug, mode, onComplete }) {
  const [state, setState] = useState<ValueForestState>(() =>
    loadValueForestState(templateSlug)
  )

  // Auto-save on state change
  useEffect(() => {
    saveValueForestState(templateSlug, state)
  }, [state, templateSlug])

  switch (state.phase) {
    case 'selection':
      return <TreeSelection ... />
    case 'deep-dive':
      return <TreeDeepDive ... />
    case 'ranking':
      return <TreeRanking ... />
    case 'overview':
      return <ForestOverview ... />
  }
}
```

---

## Progress Bar Integration

Show % complete within Value Forest:

```typescript
function calculateForestProgress(state: ValueForestState): number {
  const { phase, selectedTreeIds, currentTreeIndex, currentQuestionIndex } = state

  // Phase weights
  const SELECTION_WEIGHT = 5   // 5%
  const DEEP_DIVE_WEIGHT = 70  // 70%
  const RANKING_WEIGHT = 10    // 10%
  const OVERVIEW_WEIGHT = 15   // 15%

  if (phase === 'selection') return 0
  if (phase === 'ranking') return SELECTION_WEIGHT + DEEP_DIVE_WEIGHT
  if (phase === 'overview') {
    const overviewProgress = currentQuestionIndex / 3
    return SELECTION_WEIGHT + DEEP_DIVE_WEIGHT + RANKING_WEIGHT + (overviewProgress * OVERVIEW_WEIGHT)
  }

  // Deep-dive: calculate based on trees and questions
  const totalQuestions = selectedTreeIds.length * 8
  const completedQuestions = (currentTreeIndex * 8) + currentQuestionIndex
  const deepDiveProgress = completedQuestions / totalQuestions

  return SELECTION_WEIGHT + (deepDiveProgress * DEEP_DIVE_WEIGHT)
}
```

---

## Implementation Order

1. **Types and constants** (~30 min)
   - Add types to `src/lib/templates/types.ts`
   - Create `src/lib/value-trees/constants.ts`

2. **Storage helpers** (~20 min)
   - Add `valueForest` to `GuestReview` interface
   - Add `loadValueForestState` / `saveValueForestState` functions

3. **TreeSelection component** (~1 hr)
   - Checkbox list with descriptions
   - Custom tree modal
   - Pre-selection logic

4. **TreeDeepDive component** (~1.5 hr)
   - 8 questions per tree
   - Reuse TypeformQuestion patterns
   - Skip question/tree functionality

5. **TreeRanking component** (~45 min)
   - ↑↓ button reordering
   - Display satisfaction scores

6. **ForestOverview component** (~1 hr)
   - Summary table
   - 3 reflection questions

7. **ValueForestSection wrapper** (~30 min)
   - Phase state machine
   - localStorage persistence

8. **Integration with review-flow.tsx** (~30 min)
   - Section detection
   - Progress bar updates

9. **Testing** (~30 min)
   - Complete flow test
   - Skip functionality
   - State persistence

---

## Dependencies

**No new npm packages needed.**

Use existing:
- shadcn: `Button`, `Checkbox`, `Input`, `Textarea`, `Dialog`
- Patterns from `TypeformQuestion`
- Storage from `guest-storage.ts`

Drag-and-drop can be added later if requested (would add `@dnd-kit`).

---

## Markdown Export

Add to `src/lib/markdown-generator.ts`:

```markdown
## Value Forest

### Your Trees (by priority)

**1. Career & Work** — Satisfaction: ●●●○○ (3/5)
- Scope: Job, professional development...
- Standards: Show up authentically...
- Proud of: Launched new product...
- Aspiration: Lead a team...

**2. Health & Body** — Satisfaction: ●●○○○ (2/5)
- Scope: ...
...

### Reflections
**Biggest gap:** ...
**Shifts in importance:** ...
**Interdependencies:** ...
```
