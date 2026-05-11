"use client"

import { memo, useCallback, useMemo } from "react"
import type { PageInfo, Rect } from "../types"

interface Props {
  pages: PageInfo[]
  rects: Rect[]
  currentPage: number
  onPageSelect: (idx: number) => void
  horizontal?: boolean
}

const EMPTY_COUNTS = new Map<number, number>()

export function ThumbnailSidebar({ pages, rects, currentPage, onPageSelect, horizontal = false }: Props) {
  const rectCountsByPage = useMemo(() => {
    if (rects.length === 0) return EMPTY_COUNTS

    const map = new Map<number, number>()
    for (const rect of rects) {
      map.set(rect.page, (map.get(rect.page) ?? 0) + 1)
    }
    return map
  }, [rects])

  if (horizontal) {
    return (
      <div className="flex gap-2 overflow-x-auto px-1 pb-2">
        {pages.map((page, idx) => (
          <Thumbnail
            key={idx}
            page={page}
            pageIdx={idx}
            rectCount={rectCountsByPage.get(idx) ?? 0}
            isActive={currentPage === idx}
            onSelect={onPageSelect}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
      {pages.map((page, idx) => (
        <Thumbnail
          key={idx}
          page={page}
          pageIdx={idx}
          rectCount={rectCountsByPage.get(idx) ?? 0}
          isActive={currentPage === idx}
          onSelect={onPageSelect}
        />
      ))}
    </div>
  )
}

interface ThumbnailProps {
  page: PageInfo
  pageIdx: number
  rectCount: number
  isActive: boolean
  onSelect: (idx: number) => void
}

function ThumbnailView({ page, pageIdx, rectCount, isActive, onSelect }: ThumbnailProps) {
  const handleSelect = useCallback(() => onSelect(pageIdx), [onSelect, pageIdx])

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={`relative flex-shrink-0 overflow-hidden border-2 transition-all w-20 ${
        isActive
          ? "border-[#ccff00] shadow-[2px_2px_0px_#ccff00]"
          : "border-slate-950 hover:border-slate-600"
      }`}
      aria-label={`Ir para página ${pageIdx + 1}`}
    >
      <div className="relative w-full" style={{ aspectRatio: `${page.width} / ${page.height}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.image}
          width={page.width}
          height={page.height}
          loading="lazy"
          decoding="async"
          alt={`Miniatura página ${pageIdx + 1}`}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 py-0.5 text-center text-[9px] font-black text-white">
        {pageIdx + 1}
      </div>

      {rectCount > 0 && (
        <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center border border-slate-950 bg-[#b91c1c] text-[8px] font-black text-white">
          {rectCount > 9 ? "9+" : rectCount}
        </div>
      )}
    </button>
  )
}

export const Thumbnail = memo(ThumbnailView)
