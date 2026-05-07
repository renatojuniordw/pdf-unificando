"use client"

import type { PageInfo, Rect } from "../types"

interface Props {
  pages: PageInfo[]
  rects: Rect[]
  currentPage: number
  onPageSelect: (idx: number) => void
  horizontal?: boolean
}

export function ThumbnailSidebar({ pages, rects, currentPage, onPageSelect, horizontal = false }: Props) {
  if (horizontal) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 px-1">
        {pages.map((page, idx) => (
          <Thumbnail
            key={idx}
            page={page}
            pageIdx={idx}
            rectCount={rects.filter((r) => r.page === idx).length}
            isActive={currentPage === idx}
            onSelect={() => onPageSelect(idx)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-2 flex-1">
      {pages.map((page, idx) => (
        <Thumbnail
          key={idx}
          page={page}
          pageIdx={idx}
          rectCount={rects.filter((r) => r.page === idx).length}
          isActive={currentPage === idx}
          onSelect={() => onPageSelect(idx)}
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
  onSelect: () => void
}

function Thumbnail({ page, pageIdx, rectCount, isActive, onSelect }: ThumbnailProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex-shrink-0 border-2 transition-all ${
        isActive
          ? "border-[#ccff00] shadow-[2px_2px_0px_#ccff00]"
          : "border-slate-950 hover:border-slate-600"
      }`}
      title={`Ir para página ${pageIdx + 1}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={page.image}
        alt={`Miniatura página ${pageIdx + 1}`}
        className="w-20 block"
        draggable={false}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 text-white text-[9px] font-black text-center py-0.5">
        {pageIdx + 1}
      </div>

      {rectCount > 0 && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-[#ff4d4d] border border-slate-950 text-white text-[8px] font-black flex items-center justify-center">
          {rectCount > 9 ? "9+" : rectCount}
        </div>
      )}
    </button>
  )
}
