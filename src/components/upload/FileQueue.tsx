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
import { useEffect, useState, useCallback } from 'react'
import { BrutalistCard } from "@/components/layout/BrutalistCard"

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
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-500 hover:text-slate-950 transition-colors flex-shrink-0"
        aria-label={`Arrastar ${item.file.name} para reordenar`}
      >
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
        type="button"
        onClick={() => onRemove(item.id)}
        className="bg-[#b91c1c] text-white border-2 border-slate-950 shadow-[2px_2px_0px_#000] p-1 font-black text-xs hover:-translate-y-0.5 transition-transform flex-shrink-0"
        aria-label={`Remover ${item.file.name}`}
      >
        ✕
      </button>
    </div>
  )
}

export function FileQueue({ files, onReorder, onRemove }: FileQueueProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<{ item: FileItem; index: number } | null>(null)

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

  const handleRemove = useCallback((id: string) => {
    const index = files.findIndex((file) => file.id === id)
    const item = files[index]
    if (!item) return

    setPendingRemoval({ item, index })
    onRemove(id)
  }, [files, onRemove])

  const handleUndo = useCallback(() => {
    if (!pendingRemoval) return
    onReorder([...files.slice(0, pendingRemoval.index), pendingRemoval.item, ...files.slice(pendingRemoval.index)])
    setPendingRemoval(null)
  }, [files, onReorder, pendingRemoval])

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= files.length) return
    onReorder(arrayMove(files, index, targetIndex))
  }, [files, onReorder])

  useEffect(() => {
    if (!pendingRemoval) return

    const timer = window.setTimeout(() => setPendingRemoval(null), 5000)
    return () => window.clearTimeout(timer)
  }, [pendingRemoval])

  const activeItem = files.find(f => f.id === activeId)

  if (!files.length) return null

  return (
    <BrutalistCard>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {files.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <SortableFileRow item={item} onRemove={handleRemove} />
              <div className="flex shrink-0 flex-col gap-1 pr-2">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="border-2 border-slate-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950 hover:bg-slate-100 transition-colors disabled:opacity-30"
                  aria-label={`Mover ${item.file.name} para cima`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === files.length - 1}
                  className="border-2 border-slate-950 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950 hover:bg-slate-100 transition-colors disabled:opacity-30"
                  aria-label={`Mover ${item.file.name} para baixo`}
                >
                  ↓
                </button>
              </div>
            </div>
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
      {pendingRemoval && (
        <div role="status" aria-live="polite" className="border-t-4 border-slate-950 bg-slate-950 text-[#ccff00] px-4 py-3 flex items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest">
            {pendingRemoval.item.file.name} removido
          </p>
          <button
            type="button"
            onClick={handleUndo}
            className="ml-auto border-2 border-[#ccff00] px-3 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-slate-950 transition-colors"
          >
            Desfazer
          </button>
        </div>
      )}
    </BrutalistCard>
  )
}
