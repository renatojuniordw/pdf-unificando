import { useState, useCallback } from "react"

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  })

  const push = useCallback((next: T | ((prev: T) => T)) => {
    setHistory((h) => {
      const nextVal = typeof next === "function" ? (next as (p: T) => T)(h.present) : next
      return { past: [...h.past, h.present], present: nextVal, future: [] }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h
      const prev = h.past[h.past.length - 1]
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h
      const next = h.future[0]
      return { past: [...h.past, h.present], present: next, future: h.future.slice(1) }
    })
  }, [])

  const reset = useCallback((val: T) => {
    setHistory({ past: [], present: val, future: [] })
  }, [])

  return {
    value: history.present,
    push,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
