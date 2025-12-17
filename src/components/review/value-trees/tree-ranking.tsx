'use client'

import { useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, ArrowLeft, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ValueTree, ValueTreeResponse, SatisfactionScore } from '@/lib/value-trees'

const SATISFACTION_LABELS: Record<SatisfactionScore, string> = {
  1: 'Extremely frustrated',
  2: 'Frustrated',
  3: 'Neutral',
  4: 'Pleased',
  5: 'Extremely pleased',
}

function SatisfactionDots({ score }: { score?: SatisfactionScore }) {
  if (!score) return null
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            'w-2 h-2 rounded-full',
            n <= score ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {SATISFACTION_LABELS[score]}
      </span>
    </div>
  )
}

interface SortableTreeItemProps {
  tree: ValueTree
  index: number
  totalCount: number
  response?: ValueTreeResponse
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortableTreeItem({
  tree,
  index,
  totalCount,
  response,
  onMoveUp,
  onMoveDown,
}: SortableTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tree.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border bg-card',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Rank number */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium text-sm">
        {index + 1}
      </div>

      {/* Tree info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium flex items-center gap-2">
          {tree.name}
          {tree.isCustom && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
              Custom
            </span>
          )}
        </div>
        {response?.satisfaction && (
          <div className="mt-1">
            <SatisfactionDots score={response.satisfaction} />
          </div>
        )}
      </div>

      {/* Up/Down buttons */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onMoveUp}
          disabled={index === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface TreeRankingProps {
  trees: ValueTree[]
  responses: Record<string, ValueTreeResponse>
  ranking: string[]
  onRankingChange: (newRanking: string[]) => void
  onContinue: () => void
  onBack: () => void
}

export function TreeRanking({
  trees,
  responses,
  ranking,
  onRankingChange,
  onContinue,
  onBack,
}: TreeRankingProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = ranking.indexOf(active.id as string)
      const newIndex = ranking.indexOf(over.id as string)
      onRankingChange(arrayMove(ranking, oldIndex, newIndex))
    }
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newRanking = [...ranking]
    ;[newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]]
    onRankingChange(newRanking)
  }

  const moveDown = (index: number) => {
    if (index === ranking.length - 1) return
    const newRanking = [...ranking]
    ;[newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]]
    onRankingChange(newRanking)
  }

  // Keyboard navigation for ranking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onContinue()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onContinue])

  // Get tree by ID
  const getTree = (id: string) => trees.find((t) => t.id === id)

  // Top 3 for confirmation display
  const topThree = ranking.slice(0, 3).map((id) => getTree(id)?.name).filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col px-6 pt-20 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Rank Your Value Trees</h1>
        <p className="text-muted-foreground">
          Drag to reorder your trees from most important to least important for the coming year.
          This isn&apos;t about which tree is objectively &quot;best&quot; - it&apos;s about where you want to focus your energy and attention.
        </p>
      </div>

      {/* Ranking List with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ranking} strategy={verticalListSortingStrategy}>
          <div className="flex-1 space-y-2 mb-8">
            {ranking.map((treeId, index) => {
              const tree = getTree(treeId)
              if (!tree) return null

              return (
                <SortableTreeItem
                  key={treeId}
                  tree={tree}
                  index={index}
                  totalCount={ranking.length}
                  response={responses[treeId]}
                  onMoveUp={() => moveUp(index)}
                  onMoveDown={() => moveDown(index)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Confirmation */}
      {topThree.length >= 3 && (
        <div className="mb-8 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Your top 3 priorities: <strong>1. {topThree[0]}</strong>, <strong>2. {topThree[1]}</strong>, <strong>3. {topThree[2]}</strong>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to continue
          </span>
          <Button onClick={onContinue}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
