'use client'

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { ForestIntro } from './forest-intro'
import { TreeSelection } from './tree-selection'
import { TreeDeepDive } from './tree-deep-dive'
import { ForestOverview } from './forest-overview'

// Code-split TreeRanking since it includes the heavy @dnd-kit library
const TreeRanking = lazy(() => import('./tree-ranking').then(mod => ({ default: mod.TreeRanking })))
import { ReviewProgressBar } from '@/components/review/progress-bar'
import {
  getValueForestState,
  saveValueForestState,
  flushStorage,
  flushAuthenticatedStorage,
  updateAuthenticatedProgress,
  loadAuthenticatedValueForest,
  saveAuthenticatedValueForest,
} from '@/lib/guest-storage'
import {
  DEFAULT_TREES,
  TREE_QUESTIONS,
  OVERVIEW_QUESTIONS,
  VALUE_FOREST_QUESTION_COUNT,
} from '@/lib/value-trees'
import type { ValueTree, ValueForestState, ValueTreeResponse, SatisfactionScore } from '@/lib/value-trees'

interface ValueForestSectionProps {
  templateSlug: string
  mode: 'digital' | 'handwriting'
  onComplete: () => void
  onBack: () => void
  user?: { id: string } | null
  /** Base question index where Value Forest starts (for database progress tracking) */
  baseQuestionIndex: number
  /** The review year (from template) */
  year: number
}

export function ValueForestSection({
  templateSlug,
  mode,
  onComplete,
  onBack,
  user,
  baseQuestionIndex,
  year,
}: ValueForestSectionProps) {
  const [state, setState] = useState<ValueForestState>(() =>
    getValueForestState(templateSlug)
  )
  const [isClient, setIsClient] = useState(false)
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false)
  // Track whether to skip the next save (prevents re-saving data we just loaded)
  const skipNextSaveRef = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional SSR hydration pattern
    setIsClient(true)
  }, [])

  // Load from database for authenticated users (once on mount)
  useEffect(() => {
    if (!isClient || !user?.id || hasLoadedFromDb) return

    const loadFromDb = async () => {
      const dbState = await loadAuthenticatedValueForest(
        user.id,
        templateSlug,
        year
      )
      if (dbState) {
        // Database has data - use it and sync to localStorage
        // Skip the next save since we're setting state from DB
        skipNextSaveRef.current = true
        setState(dbState)
        saveValueForestState(templateSlug, dbState)
      }
      setHasLoadedFromDb(true)
    }

    loadFromDb()
  }, [isClient, user?.id, templateSlug, year, hasLoadedFromDb])

  // Auto-save on state change
  useEffect(() => {
    if (isClient && hasLoadedFromDb) {
      // Skip save if this state change came from a DB load
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false
        return
      }

      // Always save to localStorage
      saveValueForestState(templateSlug, state)

      // Also save to database for authenticated users
      if (user?.id) {
        saveAuthenticatedValueForest(
          user.id,
          templateSlug,
          year,
          state
        )
      }
    }
  }, [state, templateSlug, year, isClient, user?.id, hasLoadedFromDb])

  // Flush pending writes on unmount
  useEffect(() => {
    return () => {
      flushStorage()
      flushAuthenticatedStorage()
    }
  }, [])

  // Get all trees (default + custom)
  const allTrees = useMemo(() => {
    return [...DEFAULT_TREES, ...state.customTrees]
  }, [state.customTrees])

  // Get selected trees in order
  const selectedTrees = useMemo(() => {
    return state.selectedTreeIds
      .map((id) => allTrees.find((t) => t.id === id))
      .filter((t): t is ValueTree => t !== undefined)
  }, [state.selectedTreeIds, allTrees])

  // Calculate progress percentage
  // Progress weights represent the relative importance of each phase:
  // - Selection: 5% (quick phase, just picking trees)
  // - Deep-dive: 70% (main content, multiple questions per tree)
  // - Ranking: 10% (single drag-and-drop interaction)
  // - Overview: 15% (final reflection questions)
  const progressPercentage = useMemo(() => {
    const SELECTION_WEIGHT = 5   // 5% for tree selection
    const DEEP_DIVE_WEIGHT = 70  // 70% for answering questions about each tree
    const RANKING_WEIGHT = 10    // 10% for priority ranking
    const OVERVIEW_WEIGHT = 15   // 15% for overview reflections

    if (state.phase === 'selection') return 0
    if (state.phase === 'ranking') return SELECTION_WEIGHT + DEEP_DIVE_WEIGHT
    if (state.phase === 'overview') {
      const overviewProgress = state.currentQuestionIndex / OVERVIEW_QUESTIONS.length
      return Math.round(
        SELECTION_WEIGHT + DEEP_DIVE_WEIGHT + RANKING_WEIGHT + overviewProgress * OVERVIEW_WEIGHT
      )
    }

    // Deep-dive phase
    if (selectedTrees.length === 0) return SELECTION_WEIGHT
    const totalQuestions = selectedTrees.length * TREE_QUESTIONS.length
    const completedQuestions =
      state.currentTreeIndex * TREE_QUESTIONS.length + state.currentQuestionIndex
    const deepDiveProgress = completedQuestions / totalQuestions

    return Math.round(SELECTION_WEIGHT + deepDiveProgress * DEEP_DIVE_WEIGHT)
  }, [state, selectedTrees])

  // Calculate effective question index for database tracking
  // This converts Value Forest progress into a linear question index
  const effectiveQuestionIndex = useMemo(() => {
    // We map the percentage progress to a linear index within Value Forest
    const progressWithinForest = Math.floor((progressPercentage / 100) * VALUE_FOREST_QUESTION_COUNT)
    return baseQuestionIndex + progressWithinForest
  }, [progressPercentage, baseQuestionIndex])

  // Track progress to database for authenticated users
  useEffect(() => {
    if (isClient && user?.id && state.phase !== 'intro') {
      updateAuthenticatedProgress(
        user.id,
        templateSlug,
        year,
        effectiveQuestionIndex
      )
    }
  }, [isClient, user?.id, templateSlug, year, effectiveQuestionIndex, state.phase])

  // Selection handlers
  const handleSelectionChange = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedTreeIds: ids }))
  }, [])

  const handleAddCustomTree = useCallback((tree: ValueTree) => {
    setState((prev) => ({
      ...prev,
      customTrees: [...prev.customTrees, tree],
    }))
  }, [])

  const handleRemoveCustomTree = useCallback((treeId: string) => {
    setState((prev) => ({
      ...prev,
      customTrees: prev.customTrees.filter((t) => t.id !== treeId),
      selectedTreeIds: prev.selectedTreeIds.filter((id) => id !== treeId),
    }))
  }, [])

  const handleIntroContinue = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'selection' }))
  }, [])

  const handleSelectionBack = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'intro' }))
  }, [])

  const handleSelectionContinue = useCallback(() => {
    // Initialize ranking with selected trees order
    setState((prev) => ({
      ...prev,
      phase: 'deep-dive',
      currentTreeIndex: 0,
      currentQuestionIndex: 0,
      ranking: prev.selectedTreeIds,
    }))
  }, [])

  // Deep-dive handlers
  const handleDeepDiveAnswer = useCallback(
    (value: string) => {
      const currentTree = selectedTrees[state.currentTreeIndex]
      if (!currentTree) return

      const questionId = TREE_QUESTIONS[state.currentQuestionIndex].id

      setState((prev) => {
        const existingResponse = prev.responses[currentTree.id] || {}
        return {
          ...prev,
          responses: {
            ...prev.responses,
            [currentTree.id]: {
              ...existingResponse,
              [questionId]:
                questionId === 'satisfaction' ? (parseInt(value) as SatisfactionScore) : value,
            },
          },
        }
      })
    },
    [selectedTrees, state.currentTreeIndex, state.currentQuestionIndex]
  )

  const handleDeepDiveNext = useCallback(() => {
    setState((prev) => {
      const nextQuestionIndex = prev.currentQuestionIndex + 1

      // If more questions in current tree
      if (nextQuestionIndex < TREE_QUESTIONS.length) {
        return { ...prev, currentQuestionIndex: nextQuestionIndex }
      }

      // Move to next tree - use selectedTreeIds.length from prev state to avoid stale closure
      const nextTreeIndex = prev.currentTreeIndex + 1
      if (nextTreeIndex < prev.selectedTreeIds.length) {
        return {
          ...prev,
          currentTreeIndex: nextTreeIndex,
          currentQuestionIndex: 0,
        }
      }

      // All trees done - go to ranking
      return {
        ...prev,
        phase: 'ranking',
      }
    })
  }, [])

  const handleDeepDivePrevious = useCallback(() => {
    setState((prev) => {
      const prevQuestionIndex = prev.currentQuestionIndex - 1

      // If more questions in current tree
      if (prevQuestionIndex >= 0) {
        return { ...prev, currentQuestionIndex: prevQuestionIndex }
      }

      // Move to previous tree
      const prevTreeIndex = prev.currentTreeIndex - 1
      if (prevTreeIndex >= 0) {
        return {
          ...prev,
          currentTreeIndex: prevTreeIndex,
          currentQuestionIndex: TREE_QUESTIONS.length - 1,
        }
      }

      // At beginning - go back to selection
      return {
        ...prev,
        phase: 'selection',
      }
    })
  }, [])

  const handleSkipQuestion = useCallback(() => {
    handleDeepDiveNext()
  }, [handleDeepDiveNext])

  const handleSkipTree = useCallback(() => {
    setState((prev) => {
      // Compute selected trees from prev state to avoid stale closure
      const allTreesLocal = [...DEFAULT_TREES, ...prev.customTrees]
      const selectedTreesLocal = prev.selectedTreeIds
        .map((id) => allTreesLocal.find((t) => t.id === id))
        .filter((t): t is ValueTree => t !== undefined)

      const currentTree = selectedTreesLocal[prev.currentTreeIndex]
      if (!currentTree) return prev

      // Mark tree as skipped
      const existingResponse = prev.responses[currentTree.id] || {}
      const nextTreeIndex = prev.currentTreeIndex + 1

      if (nextTreeIndex < selectedTreesLocal.length) {
        return {
          ...prev,
          responses: {
            ...prev.responses,
            [currentTree.id]: { ...existingResponse, skipped: true },
          },
          currentTreeIndex: nextTreeIndex,
          currentQuestionIndex: 0,
        }
      }

      // Last tree - go to ranking
      return {
        ...prev,
        responses: {
          ...prev.responses,
          [currentTree.id]: { ...existingResponse, skipped: true },
        },
        phase: 'ranking',
      }
    })
  }, [])

  // Ranking handlers
  const handleRankingChange = useCallback((newRanking: string[]) => {
    setState((prev) => ({ ...prev, ranking: newRanking }))
  }, [])

  const handleRankingContinue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'overview',
      currentQuestionIndex: -1, // Start with table view
    }))
  }, [])

  const handleRankingBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'deep-dive',
      currentTreeIndex: prev.selectedTreeIds.length - 1,
      currentQuestionIndex: TREE_QUESTIONS.length - 1,
    }))
  }, [])

  // Overview handlers
  const handleOverviewAnswer = useCallback((questionId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      overviewResponses: {
        ...prev.overviewResponses,
        [questionId]: value,
      },
    }))
  }, [])

  const handleOverviewNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }))
  }, [])

  const handleOverviewPrevious = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(-1, prev.currentQuestionIndex - 1),
    }))
  }, [])

  const handleOverviewComplete = useCallback(() => {
    flushStorage()
    onComplete()
  }, [onComplete])

  const handleOverviewBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'ranking',
    }))
  }, [])

  // Don't render on server
  if (!isClient) {
    return null
  }

  // Get current tree for deep-dive
  const currentTree = selectedTrees[state.currentTreeIndex]
  const currentResponse = currentTree ? state.responses[currentTree.id] : undefined

  // Get current question value for deep-dive
  const getCurrentQuestionValue = () => {
    if (!currentTree || !currentResponse) return undefined
    const questionId = TREE_QUESTIONS[state.currentQuestionIndex]?.id
    if (!questionId) return undefined
    const value = currentResponse[questionId as keyof ValueTreeResponse]
    return value !== undefined ? String(value) : undefined
  }

  // Intro doesn't show progress bar
  if (state.phase === 'intro') {
    return <ForestIntro onContinue={handleIntroContinue} onBack={onBack} />
  }

  return (
    <>
      <ReviewProgressBar
        current={progressPercentage}
        total={100}
        sectionName="4) Value Forest"
        sectionCurrent={progressPercentage}
        sectionTotal={100}
      />

      {state.phase === 'selection' && (
        <TreeSelection
          selectedIds={state.selectedTreeIds}
          customTrees={state.customTrees}
          onSelectionChange={handleSelectionChange}
          onAddCustomTree={handleAddCustomTree}
          onRemoveCustomTree={handleRemoveCustomTree}
          onContinue={handleSelectionContinue}
          onBack={handleSelectionBack}
        />
      )}

      {state.phase === 'deep-dive' && currentTree && (
        <TreeDeepDive
          tree={currentTree}
          treeIndex={state.currentTreeIndex}
          totalTrees={selectedTrees.length}
          questionIndex={state.currentQuestionIndex}
          existingValue={getCurrentQuestionValue()}
          mode={mode}
          onAnswer={handleDeepDiveAnswer}
          onNext={handleDeepDiveNext}
          onPrevious={handleDeepDivePrevious}
          onSkipQuestion={handleSkipQuestion}
          onSkipTree={handleSkipTree}
        />
      )}

      {state.phase === 'ranking' && (
        <ErrorBoundary>
          <Suspense fallback={
            <div className="min-h-screen flex flex-col px-6 pt-20 pb-12 max-w-3xl mx-auto animate-pulse">
              <div className="h-8 w-64 bg-muted rounded mb-4" />
              <div className="h-4 w-96 bg-muted rounded mb-8" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          }>
            <TreeRanking
            trees={selectedTrees}
            responses={state.responses}
            ranking={state.ranking}
            onRankingChange={handleRankingChange}
            onContinue={handleRankingContinue}
            onBack={handleRankingBack}
          />
          </Suspense>
        </ErrorBoundary>
      )}

      {state.phase === 'overview' && (
        <ForestOverview
          trees={selectedTrees}
          responses={state.responses}
          ranking={state.ranking}
          overviewResponses={state.overviewResponses}
          currentQuestionIndex={state.currentQuestionIndex}
          mode={mode}
          onAnswer={handleOverviewAnswer}
          onNext={handleOverviewNext}
          onPrevious={handleOverviewPrevious}
          onComplete={handleOverviewComplete}
          onBack={handleOverviewBack}
        />
      )}
    </>
  )
}
