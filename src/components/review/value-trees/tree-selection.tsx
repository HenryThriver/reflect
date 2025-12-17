'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, X, ChevronUp } from 'lucide-react'
import { DEFAULT_TREES, generateCustomTreeId } from '@/lib/value-trees'
import type { ValueTree } from '@/lib/value-trees'

interface TreeSelectionProps {
  selectedIds: string[]
  customTrees: ValueTree[]
  onSelectionChange: (ids: string[]) => void
  onAddCustomTree: (tree: ValueTree) => void
  onRemoveCustomTree: (treeId: string) => void
  onContinue: () => void
  onBack: () => void
}

export function TreeSelection({
  selectedIds,
  customTrees,
  onSelectionChange,
  onAddCustomTree,
  onRemoveCustomTree,
  onContinue,
  onBack,
}: TreeSelectionProps) {
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  const allTrees = [...DEFAULT_TREES, ...customTrees]

  const handleToggle = (treeId: string) => {
    if (selectedIds.includes(treeId)) {
      onSelectionChange(selectedIds.filter((id) => id !== treeId))
    } else {
      onSelectionChange([...selectedIds, treeId])
    }
  }

  const handleSelectAll = () => {
    onSelectionChange(allTrees.map((t) => t.id))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const handleAddCustomTree = () => {
    if (!customName.trim()) return

    const newTree: ValueTree = {
      id: generateCustomTreeId(customName),
      name: customName.trim(),
      description: customDescription.trim() || undefined,
      isCustom: true,
    }

    onAddCustomTree(newTree)
    // Auto-select the new tree
    onSelectionChange([...selectedIds, newTree.id])

    // Reset modal
    setCustomName('')
    setCustomDescription('')
    setShowCustomModal(false)
  }

  const handleRemoveCustomTree = (treeId: string) => {
    onRemoveCustomTree(treeId)
    onSelectionChange(selectedIds.filter((id) => id !== treeId))
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-20 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Select Your Value Trees</h1>
        <p className="text-muted-foreground">
          Select the life areas that are relevant to you right now. You&apos;ll reflect on each one you choose.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          You&apos;ve selected {selectedIds.length} {selectedIds.length === 1 ? 'tree' : 'trees'}
        </span>
      </div>

      {/* Tree List */}
      <div className="flex-1 space-y-3 mb-8">
        {allTrees.map((tree) => (
          <div
            key={tree.id}
            className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => handleToggle(tree.id)}
          >
            <Checkbox
              id={tree.id}
              checked={selectedIds.includes(tree.id)}
              onCheckedChange={() => handleToggle(tree.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={tree.id}
                className="text-base font-medium cursor-pointer flex items-center gap-2"
              >
                {tree.name}
                {tree.isCustom && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Custom
                  </span>
                )}
              </Label>
              {tree.description && (
                <p className="text-sm text-muted-foreground mt-1">{tree.description}</p>
              )}
            </div>
            {tree.isCustom && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveCustomTree(tree.id)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {/* Add Custom Tree Button */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-auto py-4"
          onClick={() => setShowCustomModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add custom tree
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          onClick={onContinue}
          disabled={selectedIds.length === 0}
          size="lg"
        >
          Continue
        </Button>
      </div>

      {/* Custom Tree Modal */}
      <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Value Tree</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-name">Name *</Label>
              <Input
                id="custom-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Creative Projects"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-description">Description (optional)</Label>
              <Textarea
                id="custom-description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Brief description of what this life area encompasses"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomTree} disabled={!customName.trim()}>
              Add Tree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
