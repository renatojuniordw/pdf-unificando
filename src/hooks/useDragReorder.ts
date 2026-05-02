'use client'

import { useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, SensorDescriptor } from '@dnd-kit/core'

interface UseDragReorderReturn<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  activeId: string | null
  sensors: SensorDescriptor<object>[]
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
}

export function useDragReorder<T extends { id: string }>(initial: T[]): UseDragReorderReturn<T> {
  const [items, setItems] = useState<T[]>(initial)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id)
      const newIndex = prev.findIndex(i => i.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }, [])

  return { items, setItems, activeId, sensors, handleDragStart, handleDragEnd }
}
