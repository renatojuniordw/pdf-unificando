"use client"

import type { Rect, DrawingRect, PageInfo } from "../types"
import { getNormalized } from "../utils"

interface Props {
  page: PageInfo
  pageIdx: number
  rects: Rect[]
  drawing: DrawingRect | null
  isProcessing: boolean
  pageRef: (el: HTMLDivElement | null) => void
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  onRemoveRect: (id: string) => void
}

export function PageCanvas({
  page,
  pageIdx,
  rects,
  drawing,
  isProcessing,
  pageRef,
  onMouseDown,
  onTouchStart,
  onRemoveRect,
}: Props) {
  const drawingHere = drawing?.page === pageIdx ? getNormalized(drawing) : null

  return (
    <div id={`page-${pageIdx}`} className="relative border-4 border-slate-950 shadow-[4px_4px_0px_#000] overflow-hidden">
      <div className="absolute top-0 left-0 z-10 bg-slate-950 text-[#ccff00] text-[10px] font-black px-2 py-1 pointer-events-none select-none">
        PÁG {pageIdx + 1}
      </div>

      <div
        ref={pageRef}
        className={`relative ${isProcessing ? "cursor-not-allowed" : "cursor-crosshair"}`}
        onMouseDown={isProcessing ? undefined : onMouseDown}
        onTouchStart={isProcessing ? undefined : onTouchStart}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.image}
          alt={`Página ${pageIdx + 1}`}
          className="w-full block"
          draggable={false}
        />

        {rects.map((r) => (
          <div
            key={r.id}
            className="absolute bg-slate-950"
            style={{
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              width: `${r.w * 100}%`,
              height: `${r.h * 100}%`,
            }}
          >
            {!isProcessing && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveRect(r.id) }}
                className="absolute -top-3 -right-3 w-7 h-7 bg-[#ff4d4d] text-white text-sm font-black flex items-center justify-center border-2 border-slate-950 z-20 hover:bg-red-700 active:scale-110 transition-transform"
                title="Remover marcação"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {drawingHere && (
          <div
            className="absolute bg-slate-950 opacity-60 pointer-events-none"
            style={{
              left: `${drawingHere.x * 100}%`,
              top: `${drawingHere.y * 100}%`,
              width: `${drawingHere.w * 100}%`,
              height: `${drawingHere.h * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  )
}
