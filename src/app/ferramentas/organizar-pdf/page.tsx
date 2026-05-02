'use client'
import { useState, useCallback, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DropZone } from '@/components/upload/DropZone'
import { ProcessingStatus } from '@/components/processing/ProcessingStatus'
import { RetryCountdown } from '@/components/processing/RetryCountdown'
import { DownloadButton } from '@/components/processing/DownloadButton'
import { PrivacyBanner } from '@/components/tools/PrivacyBanner'
import { useFileProcessor } from '@/hooks/useFileProcessor'
import { usePdfPages } from '@/hooks/usePdfPages'
import { getTool } from '@/config/tools'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'

const tool = getTool('organizar-pdf')

interface PageItem { id: string; index: number; dataUrl: string; removed: boolean }

function SortablePage({ item, onRemove }: { item: PageItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative border-4 border-slate-950 ${isDragging ? 'opacity-0' : ''} ${item.removed ? 'opacity-30' : ''}`}>
      <img src={item.dataUrl} alt={`Página ${item.index + 1}`} className="w-full" />
      <div className="absolute top-1 left-1 bg-slate-950 text-[#ccff00] text-[9px] font-black px-1.5 py-0.5 uppercase">{item.index + 1}</div>
      <button {...attributes} {...listeners} className="absolute top-1 right-8 bg-white border-2 border-slate-950 p-0.5 cursor-grab">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="2" width="2" height="2"/><rect x="5" y="2" width="2" height="2"/><rect x="8" y="2" width="2" height="2"/><rect x="2" y="5" width="2" height="2"/><rect x="5" y="5" width="2" height="2"/><rect x="8" y="5" width="2" height="2"/><rect x="2" y="8" width="2" height="2"/><rect x="5" y="8" width="2" height="2"/><rect x="8" y="8" width="2" height="2"/></svg>
      </button>
      <button onClick={onRemove} className="absolute top-1 right-1 bg-[#ff4d4d] text-white border-2 border-slate-950 p-0.5 font-black text-[10px]">✕</button>
    </div>
  )
}

export default function OrganizarPdfPage() {
  const { pages, loading, loadFile } = usePdfPages()
  const [items, setItems] = useState<PageItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const { status, error, downloadUrl, outputName, processedSize, process, reset, secondsLeft, progress } = useFileProcessor({
    endpoint: '/api/pdf/organize',
    outputFilename: (name) => name.replace('.pdf', '-organizado.pdf'),
  })

  useEffect(() => {
    if (pages.length) {
      setItems(pages.map(p => ({ id: `page-${p.index}`, index: p.index, dataUrl: p.dataUrl, removed: false })))
    }
  }, [pages])

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }))

  const handleDragStart = useCallback((e: DragStartEvent) => setActiveId(e.active.id as string), [])
  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over || active.id === over.id) return
    setItems(prev => {
      const oi = prev.findIndex(i => i.id === active.id)
      const ni = prev.findIndex(i => i.id === over.id)
      return arrayMove(prev, oi, ni)
    })
  }, [])

  const handleDrop = useCallback((files: File[]) => {
    setOriginalFile(files[0])
    loadFile(files[0])
  }, [loadFile])

  const activeItem = items.find(i => i.id === activeId)

  const handleProcess = useCallback(() => {
    if (!originalFile) return
    const order = items.filter(i => !i.removed).map(i => i.index).join(',')
    process(originalFile, { pages: order })
  }, [process, items, originalFile])

  const handleReset = useCallback(() => { reset(); setItems([]); setOriginalFile(null) }, [reset])

  return (
    <>
      <section className="bg-[#ccff00] border-b-4 border-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <span className="inline-block bg-slate-950 text-[#ccff00] font-black uppercase tracking-widest text-[10px] px-3 py-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000] mb-4">FERRAMENTA GRATUITA</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] text-slate-950">{tool.name}</h1>
          <p className="text-sm font-mono font-bold uppercase text-slate-700 mt-4 max-w-xl">{tool.seoDescription}</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {status === 'idle' && items.length === 0 && !loading && <div className="max-w-2xl"><DropZone accept={{'application/pdf':['.pdf']}} onDrop={handleDrop}/></div>}
        {loading && <div className="max-w-2xl"><ProcessingStatus status="processing"/></div>}
        {items.length > 0 && status === 'idle' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest">{items.filter(i=>!i.removed).length} PÁGINAS ATIVAS</p>
              <button onClick={handleProcess} className="bg-slate-950 text-[#ccff00] border-4 border-slate-950 shadow-[4px_4px_0px_#ccff00] px-6 py-3 font-black uppercase tracking-widest text-xs hover:bg-slate-800 hover:-translate-y-1 transition-all">REORGANIZAR PDF</button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i=>i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                  {items.map(item => (
                    <SortablePage key={item.id} item={item} onRemove={() => setItems(prev => prev.map(i => i.id===item.id ? {...i, removed:!i.removed} : i))}/>
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>{activeItem && <div className="border-4 border-[#ccff00] shadow-[4px_4px_0px_#ccff00]"><img src={activeItem.dataUrl} alt="" className="w-24"/></div>}</DragOverlay>
            </DndContext>
          </div>
        )}
        {(status==='uploading'||status==='processing') && <div className="max-w-2xl"><ProcessingStatus status={status}/></div>}
        {status==='rate_limited' && <div className="max-w-2xl"><RetryCountdown secondsLeft={secondsLeft} progress={progress} onRetry={handleReset}/></div>}
        {status==='error' && (
          <div className="max-w-2xl bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
            <p className="font-black uppercase tracking-widest text-sm">ERRO: {error}</p>
            <button onClick={handleReset} className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs">TENTAR NOVAMENTE</button>
          </div>
        )}
        {status==='done' && downloadUrl && <div className="max-w-2xl"><DownloadButton url={downloadUrl} filename={outputName!} fileSize={processedSize} onReset={handleReset}/></div>}
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-12"><PrivacyBanner /></div>
    </>
  )
}
