# Value Trees Interface Implementation Plan

## Overview

The Value Forest is a multi-step interface within Section 5 of Henry's Annual Review template. It allows users to:
1. **Select** which Value Trees apply to them (5B)
2. **Deep-dive** into each selected tree with 8 questions per tree (5C)
3. **Rank** their trees by priority (5D)
4. **View** a summary with insights about focus areas (5E)

## Architecture

### New Components Needed

```
src/components/review/
├── value-trees/
│   ├── tree-selection.tsx       # 5B - Checkbox selection of 13 trees + custom
│   ├── tree-deep-dive.tsx       # 5C - Per-tree 8-question flow
│   ├── tree-ranking.tsx         # 5D - Drag-and-drop prioritization
│   ├── forest-overview.tsx      # 5E - Visual summary + reflection questions
│   └── value-forest-flow.tsx    # Orchestrator component for the whole section
```

### Data Structures

```typescript
// Add to src/lib/templates/types.ts or new src/lib/value-trees/types.ts

export interface ValueTree {
  id: string
  name: string
  description: string
  preSelected: boolean
  isCustom: boolean
}

export interface ValueTreeResponse {
  treeId: string
  scope: string           // 5C.1
  standards: string       // 5C.2
  proudOf: string         // 5C.3
  gratitude: string       // 5C.4
  heldBack: string        // 5C.5
  aspiration: string      // 5C.6
  helpNeeded: string      // 5C.7
  satisfaction: number    // 5C.8 (1-5 scale)
}

export interface ValueForestState {
  selectedTrees: string[]           // IDs of selected trees
  customTrees: ValueTree[]          // User-created trees
  treeResponses: Record<string, ValueTreeResponse>
  treeRanking: string[]             // Ordered array of tree IDs
  currentTreeIndex: number          // Which tree we're on in deep-dive
  forestPhase: 'selection' | 'intro' | 'deep-dive' | 'ranking' | 'overview'
}
```

### Storage Updates

```typescript
// Update src/lib/guest-storage.ts

export interface GuestReview {
  // ...existing fields
  valueForest?: ValueForestState
}
```

---

## Implementation Steps

### Step 1: Define Value Tree Constants

Create `src/lib/value-trees/constants.ts`:

```typescript
export const DEFAULT_VALUE_TREES: ValueTree[] = [
  { id: 'health-body', name: 'Health & Body', description: 'Physical health, fitness, energy, nutrition, sleep', preSelected: true, isCustom: false },
  { id: 'career-work', name: 'Career & Work', description: 'Job, professional development, business, impact', preSelected: true, isCustom: false },
  { id: 'finances', name: 'Finances', description: 'Income, savings, investments, financial security', preSelected: true, isCustom: false },
  { id: 'partnership', name: 'Partnership', description: 'Romantic relationship, marriage, significant other', preSelected: false, isCustom: false },
  { id: 'family', name: 'Family', description: 'Parents, siblings, extended family, chosen family', preSelected: true, isCustom: false },
  { id: 'friendships-community', name: 'Friendships & Community', description: 'Social connections, meaningful relationships, belonging', preSelected: true, isCustom: false },
  { id: 'home-environment', name: 'Home & Environment', description: 'Physical space, where you live, your sanctuary', preSelected: false, isCustom: false },
  { id: 'learning-intellect', name: 'Learning & Intellect', description: 'Reading, studying, skill development, curiosity', preSelected: true, isCustom: false },
  { id: 'creativity-play', name: 'Creativity & Play', description: 'Hobbies, creative expression, fun, leisure', preSelected: false, isCustom: false },
  { id: 'spirituality-meaning', name: 'Spirituality & Meaning', description: 'Inner life, purpose, faith, practices, presence', preSelected: false, isCustom: false },
  { id: 'giving-service', name: 'Giving & Service', description: 'Contribution, volunteering, mentoring, social impact', preSelected: false, isCustom: false },
  { id: 'experiences-adventure', name: 'Experiences & Adventure', description: 'Travel, culture, new experiences, exploration', preSelected: false, isCustom: false },
  { id: 'parenthood', name: 'Parenthood', description: 'Children, caregiving, parenting', preSelected: false, isCustom: false },
]
```

### Step 2: Tree Selection Component (5B)

`src/components/review/value-trees/tree-selection.tsx`:

**Features:**
- Checkbox list of 13 default trees
- 6 pre-selected by default
- Description shown next to each tree
- "Select All" / "Clear" buttons
- Counter: "You've selected X trees"
- "+ Add custom tree" button at bottom
- Custom tree modal with name (required) + description (optional)
- Custom trees appear at bottom of list, auto-selected
- "Continue" button (minimum 1 tree required)

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Select Your Value Trees                             │
│  Select the life areas relevant to you right now.   │
│                                                      │
│  [Select All] [Clear]        You've selected: 6     │
│                                                      │
│  ☑ Health & Body                                    │
│    Physical health, fitness, energy, nutrition...   │
│                                                      │
│  ☑ Career & Work                                    │
│    Job, professional development, business...       │
│                                                      │
│  ... (11 more)                                      │
│                                                      │
│  [+ Add custom tree]                                │
│                                                      │
│  ──────────────────────────────────────────────────│
│                                      [Continue →]   │
└─────────────────────────────────────────────────────┘
```

### Step 3: Deep-Dive Intro Component

Brief transition screen shown once before first tree:

**Content:**
> Each Value Tree has a structure:
> - **Roots (Scope)** — What this area encompasses for you
> - **Trunk (Standards)** — How you want to show up
> - **Branches (Resolves)** — What you want to achieve
> - **Leaves (Outcomes)** — Specific projects or milestones

### Step 4: Per-Tree Deep-Dive Component (5C)

`src/components/review/value-trees/tree-deep-dive.tsx`:

**For each selected tree, show 8 questions:**

1. **Scope** (textarea, pre-filled with tree description)
2. **Standards** (textarea)
3. **Proud of** (textarea)
4. **Gratitude** (textarea)
5. **Held back** (textarea)
6. **Aspiration** (textarea)
7. **Help needed** (textarea)
8. **Satisfaction** (5-point scale)

**Progress indicator:** "Tree 3 of 8: Finances"

**Features:**
- Same TypeformQuestion styling for consistency
- "Skip this tree" option
- Progress bar shows tree progress (not overall question progress)
- After last question of a tree, advance to next tree
- After all trees complete, advance to ranking

### Step 5: Ranking Component (5D)

`src/components/review/value-trees/tree-ranking.tsx`:

**Features:**
- Drag-and-drop list of selected trees
- Numbered positions (1, 2, 3...)
- Each item shows: Tree name + snippet of aspiration
- Mobile-friendly: could use up/down buttons instead of drag
- Confirmation at bottom: "Your top 3 priorities: 1. X, 2. Y, 3. Z"

**Libraries:**
- Use `@dnd-kit/core` for drag-and-drop (or simpler approach with up/down buttons)
- Already have shadcn components for buttons

### Step 6: Forest Overview Component (5E)

`src/components/review/value-trees/forest-overview.tsx`:

**Two parts:**

**Part A - The Reveal (Visual Summary):**
```
YOUR VALUE FOREST (by priority)

Priority    Tree                    Satisfaction
────────────────────────────────────────────────
1.          Career & Work           ●●●○○ Neutral
2.          Health & Body           ●●○○○ Dissatisfied
...

🎯 Focus areas (high priority + low satisfaction):
   • Career & Work (Priority #1, Neutral)
   • Health & Body (Priority #2, Dissatisfied)

✅ Protect (high priority + high satisfaction):
   • Partnership (Priority #3, Satisfied)
```

**Part B - Reflection Questions:**
1. Where is the biggest gap between where you are and where you want to be?
2. Are there trees that have shifted in importance this year?
3. How do your different trees affect each other?

**Logic:**
- Focus areas = Top half of priorities with satisfaction ≤ 3
- Protect = Top half of priorities with satisfaction ≥ 4

### Step 7: Orchestrator Component

`src/components/review/value-trees/value-forest-flow.tsx`:

**State machine:**
```
selection → intro → deep-dive (loop per tree) → ranking → overview
```

**Responsibilities:**
- Track current phase
- Track which tree we're on in deep-dive
- Save/restore all state to localStorage
- Handle navigation between phases
- Handle "skip tree" functionality

### Step 8: Integration with Review Flow

Update `src/components/review/review-flow.tsx`:

**Option A: Replace Section 5 questions with Value Forest component**
- When section is "Section 5: Value Forest", render `<ValueForestFlow>` instead of `<TypeformQuestion>`

**Option B: Treat Value Forest as a special screen type**
- Add new screen type: `'value-forest'`
- Insert after Section 4 questions, before Section 6

**Recommended: Option A** - Cleaner separation of concerns

### Step 9: Update henry.ts Template

Remove existing Section 5 questions (tree-1-gratitude, etc.) and replace with a single marker question that triggers the Value Forest interface, OR handle via section detection in review-flow.tsx.

---

## Component Details

### TreeSelection Props
```typescript
interface TreeSelectionProps {
  selectedTrees: string[]
  customTrees: ValueTree[]
  onSelectionChange: (selected: string[]) => void
  onAddCustomTree: (tree: ValueTree) => void
  onContinue: () => void
}
```

### TreeDeepDive Props
```typescript
interface TreeDeepDiveProps {
  tree: ValueTree
  treeIndex: number
  totalTrees: number
  existingResponse?: ValueTreeResponse
  mode: 'digital' | 'handwriting'
  onComplete: (response: ValueTreeResponse) => void
  onSkip: () => void
  onBack: () => void
}
```

### TreeRanking Props
```typescript
interface TreeRankingProps {
  trees: ValueTree[]
  treeResponses: Record<string, ValueTreeResponse>
  initialRanking?: string[]
  onComplete: (ranking: string[]) => void
  onBack: () => void
}
```

### ForestOverview Props
```typescript
interface ForestOverviewProps {
  trees: ValueTree[]
  treeResponses: Record<string, ValueTreeResponse>
  ranking: string[]
  onComplete: (overviewResponses: Record<string, string>) => void
  onBack: () => void
}
```

---

## Dependencies

**New npm packages:**
- `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop ranking (optional - could use simple up/down buttons instead)

**Existing components to reuse:**
- `Button`, `Checkbox`, `Input`, `Textarea`, `Dialog` from shadcn
- `TypeformQuestion` styling patterns
- `ReviewProgressBar` (may need to extend for tree progress)

---

## Markdown Export Updates

Update `src/lib/markdown-generator.ts` to include Value Forest section:

```markdown
## Value Forest

### Selected Trees (by priority)
1. **Career & Work** - Satisfaction: Neutral (3/5)
   - Scope: Job, professional development...
   - Standards: Show up authentically...
   - Proud of: Launched new product...
   - Aspiration: Lead a team...

2. **Health & Body** - Satisfaction: Dissatisfied (2/5)
   ...

### Focus Areas
- Career & Work (Priority #1, Neutral)
- Health & Body (Priority #2, Dissatisfied)

### Protect
- Partnership (Priority #3, Satisfied)

### Reflections
**Biggest gap:** ...
**Shifts:** ...
**Interdependencies:** ...
```

---

## Estimated Complexity

| Component | Complexity | Notes |
|-----------|------------|-------|
| TreeSelection | Medium | Checkbox list + custom tree modal |
| TreeDeepDive | Medium | Reuse TypeformQuestion patterns, loop logic |
| TreeRanking | Medium-High | Drag-and-drop or up/down buttons |
| ForestOverview | Medium | Visual display + calculations + 3 questions |
| ValueForestFlow | High | State machine, localStorage sync |
| Storage updates | Low | Add valueForest to GuestReview |
| Markdown export | Low | Add section to generator |

**Total estimate:** 6-8 components, significant but well-scoped work.

---

## Implementation Order

1. **Types and constants** - Define data structures
2. **Storage updates** - Add valueForest to GuestStorage
3. **TreeSelection** - First user-facing component
4. **TreeDeepDive** - Core question flow per tree
5. **TreeRanking** - Prioritization interface
6. **ForestOverview** - Visual summary + final questions
7. **ValueForestFlow** - Orchestrator connecting all phases
8. **Review integration** - Hook into main review-flow.tsx
9. **Markdown export** - Include Value Forest in final output
10. **Testing & polish** - Ensure all flows work correctly

---

## Open Questions

1. **Quick mode:** Should we implement the abbreviated 3-question mode (proud + aspiration + satisfaction) as a toggle?
2. **Drag-and-drop library:** Use `@dnd-kit` or simpler up/down button approach for mobile?
3. **Section detection:** How to cleanly transition from Section 4 → Value Forest → Section 6?
4. **Progress bar:** Show overall tree progress ("Tree 3/8") or question-within-tree progress?
