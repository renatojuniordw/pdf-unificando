"use client"

import { memo, useCallback, useRef } from "react"
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"
import type { Rect, DrawingRect, PageInfo } from "../types"
import { getNormalized } from "../utils"

interface Props {
  page: PageInfo
  pageIdx: number
  rects: Rect[]
  drawing: DrawingRect | null
  isProcessing: boolean
  onRegisterRef: (pageIdx: number, el: HTMLDivElement | null) => void
  onStartMouseDown: (pageIdx: number, e: ReactMouseEvent<HTMLDivElement>) => void
  onStartTouchStart: (pageIdx: number, e: ReactTouchEvent<HTMLDivElement>) => void
  onRemoveRect: (id: string) => void
}

function PageCanvasView({
  page,
  pageIdx,
  rects,
  drawing,
  isProcessing,
  onRegisterRef,
  onStartMouseDown,
  onStartTouchStart,
  onRemoveRect,
}: Props) {
  const drawingHere = drawing?.page === pageIdx ? getNormalized(drawing) : null
  const pageNodeRef = useRef<HTMLDivElement | null>(null)
  const setPageRef = useCallback((el: HTMLDivElement | null) => {
    pageNodeRef.current = el
    onRegisterRef(pageIdx, el)
  }, [onRegisterRef, pageIdx])
  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    onStartMouseDown(pageIdx, e)
  }, [onStartMouseDown, pageIdx])
  const handleTouchStart = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    onStartTouchStart(pageIdx, e)
  }, [onStartTouchStart, pageIdx])

  return (
    <div id={`page-${pageIdx}`} className="relative overflow-hidden border-4 border-slate-950 shadow-[4px_4px_0px_#000]">
      <div className="pointer-events-none absolute left-0 top-0 z-10 select-none bg-slate-950 px-2 py-1 text-[10px] font-black text-[#ccff00]">
        PÁG {pageIdx + 1}
      </div>

      <div
        ref={setPageRef}
        className={`relative ${isProcessing ? "cursor-not-allowed" : "cursor-crosshair"}`}
        onMouseDown={isProcessing ? undefined : handleMouseDown}
        onTouchStart={isProcessing ? undefined : handleTouchStart}
      >
        <div className="relative w-full" style={{ aspectRatio: `${page.width} / ${page.height}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.image}
            width={page.width}
            height={page.height}
            loading="lazy"
            decoding="async"
            alt={`Página ${pageIdx + 1}`}
            className="absolute inset-0 block h-full w-full object-contain"
            draggable={false}
          />
        </div>

        <>
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
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveRect(r.id)
                  }}
                  className="absolute -right-3 -top-3 z-20 flex h-7 w-7 items-center justify-center border-2 border-slate-950 bg-[#b91c1c] text-sm font-black text-white transition-transform hover:bg-red-700 active:scale-110"
                  aria-label="Remover marcação"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {drawingHere && (
            <div
              className="pointer-events-none absolute bg-slate-950 opacity-60"
              style={{
                left: `${drawingHere.x * 100}%`,
                top: `${drawingHere.y * 100}%`,
                width: `${drawingHere.w * 100}%`,
                height: `${drawingHere.h * 100}%`,
              }}
            />
          )}
        </>
      </div>
    </div>
  )
}

export const PageCanvas = memo(PageCanvasView)
