'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

interface UseKeyboardNavigationOptions {
  onNext?: () => void
  onPrevious?: () => void
  onEscape?: () => void
  /**
   * If true, Enter key alone triggers onNext.
   * If false (default for textarea), requires Cmd/Ctrl+Enter for onNext.
   */
  enterToAdvance?: boolean
  /**
   * If true, number keys within the specified range will trigger onNumberKey callback.
   * Default range is 1-5.
   */
  enableNumberKeys?: boolean
  /**
   * Range for number keys [min, max]. Default: [1, 5]
   */
  numberKeyRange?: [number, number]
  onNumberKey?: (num: number) => void
  /**
   * Whether keyboard navigation is enabled
   */
  enabled?: boolean
}

// Use useLayoutEffect on client, useEffect on server (for SSR compatibility)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Shared keyboard navigation hook for review flow components.
 * Handles Enter, Arrow keys, PageUp/PageDown, Escape, and optionally number keys.
 * Uses refs for callbacks to avoid excessive effect re-runs.
 */
export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onEscape,
  enterToAdvance = true,
  enableNumberKeys = false,
  numberKeyRange = [1, 5],
  onNumberKey,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  // Use refs for callbacks to avoid re-attaching listeners on every render
  const onNextRef = useRef(onNext)
  const onPreviousRef = useRef(onPrevious)
  const onEscapeRef = useRef(onEscape)
  const onNumberKeyRef = useRef(onNumberKey)

  // Update refs in an effect (not during render) to satisfy lint rules
  useIsomorphicLayoutEffect(() => {
    onNextRef.current = onNext
    onPreviousRef.current = onPrevious
    onEscapeRef.current = onEscape
    onNumberKeyRef.current = onNumberKey
  })

  useEffect(() => {
    if (!enabled) return

    const [minKey, maxKey] = numberKeyRange

    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys for scale questions (configurable range)
      if (enableNumberKeys && onNumberKeyRef.current) {
        const num = parseInt(e.key)
        if (!isNaN(num) && num >= minKey && num <= maxKey) {
          onNumberKeyRef.current(num)
          return
        }
      }

      // Enter key handling
      if (e.key === 'Enter') {
        e.preventDefault()
        if (enterToAdvance) {
          onNextRef.current?.()
        } else if (e.metaKey || e.ctrlKey) {
          // Cmd/Ctrl+Enter for textarea mode
          onNextRef.current?.()
        }
        return
      }

      // Arrow/Page navigation
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        onNextRef.current?.()
        return
      }

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        onPreviousRef.current?.()
        return
      }

      // Escape
      if (e.key === 'Escape' && onEscapeRef.current) {
        e.preventDefault()
        onEscapeRef.current()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, enterToAdvance, enableNumberKeys, numberKeyRange])
}
