'use client'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useCallback } from 'react'

interface FileItem {
  id: string
  file: File
}

interface FileQueueProps {
  files: FileItem[]
  onReorder: (files: FileItem[]) => void
  onRemove: (id: string) => void
}

function SortableFileRow({ item, onRemove }: { item: FileItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 border-b-2 border-slate-200 last:border-b-0 ${
        isDragging ? 'opacity-0' : ''
      }`}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-950 transition-colors flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="3" width="2" height="2" />
          <rect x="7" y="3" width="2" height="2" />
          <rect x="11" y="3" width="2" height="2" />
          <rect x="3" y="7" width="2" height="2" />
          <rect x="7" y="7" width="2" height="2" />
          <rect x="11" y="7" width="2" height="2" />
          <rect x="3" y="11" width="2" height="2" />
          <rect x="7" y="11" width="2" height="2" />
          <rect x="11" y="11" width="2" height="2" />
        </svg>
      </button>
      <span className="font-mono font-bold uppercase text-sm truncate flex-1 text-slate-950">{item.file.name}</span>
      <span className="text-xs font-mono text-slate-400 uppercase flex-shrink-0">
        {(item.file.size / 1024 / 1024).toFixed(1)}MB
      </span>
      <button
        onClick={() => onRemove(item.id)}
        className="bg-[#ff4d4d] text-white border-2 border-slate-950 shadow-[2px_2px_0px_#000] p-1 font-black text-xs hover:-translate-y-0.5 transition-transform flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

export function FileQueue({ files, onReorder, onRemove }: FileQueueProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }, [])

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = files.findIndex(f => f.id === active.id)
    const newIndex = files.findIndex(f => f.id === over.id)
    onReorder(arrayMove(files, oldIndex, newIndex))
  }, [files, onReorder])

  const activeItem = files.find(f => f.id === activeId)

  if (!files.length) return null

  return (
    <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000]">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {files.map(item => (
            <SortableFileRow key={item.id} item={item} onRemove={onRemove} />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeItem && (
            <div className="flex items-center gap-4 p-4 bg-[#ccff00] border-4 border-slate-950 shadow-[4px_4px_0px_#000]">
              <span className="font-mono font-bold uppercase text-sm truncate flex-1">{activeItem.file.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
