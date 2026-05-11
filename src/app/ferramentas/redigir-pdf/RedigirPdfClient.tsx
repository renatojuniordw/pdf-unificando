"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"
import { DropZone } from "@/components/upload/DropZone"
import { PromotionBanner } from "@/components/tools/PromotionBanner"
import { DownloadButton } from "@/components/processing/DownloadButton"
import { useHistory } from "./hooks/useHistory"
import { getNormalized, clamp } from "./utils"
import { PageCanvas } from "./components/PageCanvas"
import { ThumbnailSidebar } from "./components/ThumbnailSidebar"
import { EditorToolbar } from "./components/EditorToolbar"
import { normalizeApiError } from "@/lib/utils/api-error"
import { logError } from "@/lib/utils/logger"
import type { Rect, PageInfo, DrawingRect, Resolution } from "./types"

type Phase =
  | { phase: "idle" }
  | { phase: "loading"; file: File }
  | { phase: "editing"; file: File; pages: PageInfo[] }
  | { phase: "processing"; file: File; pages: PageInfo[] }
  | { phase: "done"; url: string; filename: string; size: number }
  | { phase: "error"; message: string }

const ZOOM_STEPS = [75, 100, 125, 150, 175, 200]
const EMPTY_RECTS: Rect[] = []
const REQUEST_TIMEOUT_MS = 60_000
const REQUEST_MAX_RETRIES = 2
const REQUEST_BASE_DELAY_MS = 350

class RetryableRequestError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "RetryableRequestError"
    this.status = status
  }
}

function isRetryableTransportError(error: unknown) {
  return (
    error instanceof DOMException && error.name === "AbortError"
  ) || (error instanceof Error && error.name === "TypeError")
}

function isRetryableResponseStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function requestJsonWithRetry<T>(input: RequestInfo | URL, init: RequestInit) {
  let lastError: unknown

  for (let attempt = 0; attempt <= REQUEST_MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutHandle = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(input, {
        ...init,
        signal: controller.signal,
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const normalized = normalizeApiError(data, res.status)
        if (isRetryableResponseStatus(res.status)) {
          throw new RetryableRequestError(normalized.message, res.status)
        }
        throw new Error(normalized.message)
      }

      return data as T
    } catch (error) {
      lastError = error

      if (
        attempt < REQUEST_MAX_RETRIES &&
        (error instanceof RetryableRequestError || isRetryableTransportError(error))
      ) {
        await delay(REQUEST_BASE_DELAY_MS * 2 ** attempt)
        continue
      }

      throw error
    } finally {
      window.clearTimeout(timeoutHandle)
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Falha inesperada.")
}

async function requestBlobWithRetry(input: RequestInfo | URL, init: RequestInit) {
  let lastError: unknown

  for (let attempt = 0; attempt <= REQUEST_MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutHandle = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(input, {
        ...init,
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const normalized = normalizeApiError(data, res.status)
        if (isRetryableResponseStatus(res.status)) {
          throw new RetryableRequestError(normalized.message, res.status)
        }
        throw new Error(normalized.message)
      }

      return await res.blob()
    } catch (error) {
      lastError = error

      if (
        attempt < REQUEST_MAX_RETRIES &&
        (error instanceof RetryableRequestError || isRetryableTransportError(error))
      ) {
        await delay(REQUEST_BASE_DELAY_MS * 2 ** attempt)
        continue
      }

      throw error
    } finally {
      window.clearTimeout(timeoutHandle)
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Falha inesperada.")
}

function friendlyMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function RedigirPdfClient() {
  const [state, setState] = useState<Phase>({ phase: "idle" })
  const [drawing, setDrawing] = useState<DrawingRect | null>(null)
  const [zoom, setZoom] = useState(100)
  const [resolution, setResolution] = useState<Resolution>(144)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchCount, setSearchCount] = useState<number | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const history = useHistory<Rect[]>([])
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const urlRef = useRef<string | null>(null)
  const rects = history.value
  const hasUnsavedChanges = rects.length > 0 || searchQuery.trim().length > 0
  const rectsByPage = useMemo(() => {
    const map = new Map<number, Rect[]>()
    for (const rect of rects) {
      const list = map.get(rect.page)
      if (list) {
        list.push(rect)
      } else {
        map.set(rect.page, [rect])
      }
    }
    return map
  }, [rects])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (state.phase !== "editing") return
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); history.undo() }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); history.redo() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [state.phase, history])

  const handleDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    setState({ phase: "loading", file })
    history.reset([])

    const hp = document.querySelector<HTMLInputElement>("[data-honeypot]")?.value ?? ""
    const formData = new FormData()
    formData.append("file", file)
    formData.append("_hp", hp)

    try {
      const data = await requestJsonWithRetry<{ pages: PageInfo[] }>("/api/pdf/redact/preview", {
        method: "POST",
        body: formData,
      })
      if (!data || !Array.isArray(data.pages)) {
        throw new Error("A resposta do servidor veio incompleta. Tente novamente.")
      }
      setState({ phase: "editing", file, pages: data.pages })
      setCurrentPage(0)
    } catch (err) {
      logError("Redigir PDF Preview", err, { fileName: file.name })
      setState({ phase: "error", message: friendlyMessage(err, "Não foi possível preparar o PDF para redação.") })
    }
  }, [history])

  const registerPageRef = useCallback((pageIdx: number, el: HTMLDivElement | null) => {
    if (el) {
      pageRefs.current.set(pageIdx, el)
      return
    }

    pageRefs.current.delete(pageIdx)
  }, [])

  // Drawing — mouse
  const handleMouseDown = useCallback((page: number, e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setDrawing({ page, startX: x, startY: y, currentX: x, currentY: y })
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!drawing) return
    const el = pageRefs.current.get(drawing.page)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1)
    setDrawing((prev) => prev ? { ...prev, currentX: x, currentY: y } : null)
  }, [drawing])

  // Drawing — touch
  const handleTouchStart = useCallback((page: number, e: ReactTouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (touch.clientX - rect.left) / rect.width
    const y = (touch.clientY - rect.top) / rect.height
    setDrawing({ page, startX: x, startY: y, currentX: x, currentY: y })
    e.preventDefault()
  }, [])

  const handleTouchMove = useCallback((e: ReactTouchEvent) => {
    if (!drawing || e.touches.length !== 1) return
    const touch = e.touches[0]
    const el = pageRefs.current.get(drawing.page)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clamp((touch.clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((touch.clientY - rect.top) / rect.height, 0, 1)
    setDrawing((prev) => prev ? { ...prev, currentX: x, currentY: y } : null)
    e.preventDefault()
  }, [drawing])

  const commitDrawing = useCallback((d: DrawingRect | null) => {
    if (!d) return
    const norm = getNormalized(d)
    if (norm.w > 0.01 && norm.h > 0.005) {
      history.push((prev) => [...prev, { id: crypto.randomUUID(), page: d.page, ...norm }])
    }
    setDrawing(null)
  }, [history])

  const handleMouseUp = useCallback(() => commitDrawing(drawing), [drawing, commitDrawing])
  const handleTouchEnd = useCallback(() => commitDrawing(drawing), [drawing, commitDrawing])

  const removeRect = useCallback((id: string) => {
    history.push((prev) => prev.filter((r) => r.id !== id))
  }, [history])

  // Zoom
  const handleZoomIn = useCallback(() => {
    setZoom((z) => ZOOM_STEPS[Math.min(ZOOM_STEPS.indexOf(z) + 1, ZOOM_STEPS.length - 1)])
  }, [])
  const handleZoomOut = useCallback(() => {
    setZoom((z) => ZOOM_STEPS[Math.max(ZOOM_STEPS.indexOf(z) - 1, 0)])
  }, [])

  // Page navigation
  const handlePageSelect = useCallback((idx: number) => {
    setCurrentPage(idx)
    document.getElementById(`page-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleSearchQueryChange = useCallback((q: string) => {
    setSearchQuery(q)
    setSearchCount(null)
    setSearchError(null)
  }, [])

  // Find and redact
  const handleSearch = useCallback(async () => {
    if (state.phase !== "editing" || !searchQuery.trim()) return
    setIsSearching(true)
    setSearchCount(null)
    setSearchError(null)
    try {
      const hp = document.querySelector<HTMLInputElement>("[data-honeypot]")?.value ?? ""
      const formData = new FormData()
      formData.append("file", state.file)
      formData.append("query", searchQuery.trim())
      formData.append("_hp", hp)
      const data = await requestJsonWithRetry<{ regions: Array<{ page: number; x: number; y: number; width: number; height: number }> }>("/api/pdf/redact/search", {
        method: "POST",
        body: formData,
      })
      if (!data || !Array.isArray(data.regions)) {
        throw new Error("A resposta da busca veio incompleta. Tente novamente.")
      }
      const newRects: Rect[] = data.regions.map((r: { page: number; x: number; y: number; width: number; height: number }) => ({
        id: crypto.randomUUID(),
        page: r.page,
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
      }))
      setSearchCount(newRects.length)
      if (newRects.length > 0) history.push((prev) => [...prev, ...newRects])
    } catch (err) {
      logError("Redigir PDF Search", err, { query: searchQuery.trim() })
      setSearchError(friendlyMessage(err, "Não foi possível concluir a busca agora. Tente novamente."))
      setSearchCount(0)
    } finally {
      setIsSearching(false)
    }
  }, [state, searchQuery, history])


  // Apply redaction
  const handleApply = useCallback(async () => {
    if (state.phase !== "editing" || history.value.length === 0) return
    const { file, pages } = state
    setState({ phase: "processing", file, pages })

    const hp = document.querySelector<HTMLInputElement>("[data-honeypot]")?.value ?? ""
    const formData = new FormData()
    formData.append("file", file)
    formData.append("_hp", hp)
    formData.append("regions", JSON.stringify(history.value.map((r) => ({ page: r.page, x: r.x, y: r.y, width: r.w, height: r.h }))))
    formData.append("resolution", String(resolution))

    try {
      const blob = await requestBlobWithRetry("/api/pdf/redact", {
        method: "POST",
        body: formData,
      })
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = URL.createObjectURL(blob)
      setState({ phase: "done", url: urlRef.current, filename: file.name.replace(".pdf", "-censurado.pdf"), size: blob.size })
    } catch (err) {
      logError("Redigir PDF Apply", err, { fileName: file.name, rectCount: history.value.length })
      setState({ phase: "error", message: friendlyMessage(err, "Não foi possível gerar o PDF censurado agora.") })
    }
  }, [state, history.value, resolution])

  const reset = useCallback(() => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null }
    setState({ phase: "idle" })
    setDrawing(null)
    history.reset([])
    setZoom(100)
    setCurrentPage(0)
    setSearchQuery("")
    setSearchCount(null)
    setSearchError(null)
    pageRefs.current.clear()
  }, [history])

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm("Você tem alterações não aplicadas. Deseja sair mesmo assim?")) {
      return
    }

    reset()
  }, [hasUnsavedChanges, reset])

  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // ── Phases ──────────────────────────────────────────────────────────────────

  if (state.phase === "idle") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-6">
          <p className="text-xs font-black uppercase tracking-widest mb-2">COMO FUNCIONA</p>
          <ol className="text-xs font-mono text-slate-600 space-y-1 list-decimal list-inside uppercase tracking-widest">
            <li>Faça upload do PDF</li>
            <li>Desenhe retângulos ou use a busca para marcar o que deseja ocultar</li>
            <li>Clique em &quot;Aplicar Alterações&quot; para gerar o PDF final</li>
          </ol>
        </div>
        <DropZone accept={{ "application/pdf": [".pdf"] }} onDrop={handleDrop} />
      </div>
    )
  }

  if (state.phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto border-4 border-slate-950 bg-white shadow-[8px_8px_0px_#000] p-12 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-slate-950 border-t-[#ccff00] rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-sm">CARREGANDO PÁGINAS...</p>
      </div>
    )
  }

  if (state.phase === "done") {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="bg-[#00ff66] text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-4 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
            <path d="M4 10l4 4 8-8" />
          </svg>
          <p className="font-black uppercase tracking-widest text-sm">
            ALTERAÇÕES APLICADAS
            <span className="font-mono text-xs ml-2">{(state.size / 1024 / 1024).toFixed(1)} MB</span>
          </p>
        </div>
        <DownloadButton url={state.url} filename={state.filename} fileSize={state.size} onReset={reset} />
        <PromotionBanner />
      </div>
    )
  }

  if (state.phase === "error") {
    return (
      <div className="max-w-2xl mx-auto bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
        <div>
          <p className="font-black uppercase tracking-widest text-sm">ERRO</p>
          <p className="font-mono text-xs uppercase mt-1">{state.message}</p>
        </div>
        <button onClick={reset} className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-[#ff4d4d] transition-colors">
          TENTAR NOVAMENTE
        </button>
      </div>
    )
  }

  // editing or processing
  const isProcessing = state.phase === "processing"
  const { pages } = state
  const currentDrawingPage = drawing?.page ?? -1

  return (
    <div className="fixed inset-0 z-50 bg-slate-200 flex flex-col overflow-hidden">
      
      {/* Top Bar - Fixed */}
      <div className="flex-shrink-0 z-20">
        <EditorToolbar
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={history.undo}
          onRedo={history.redo}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          resolution={resolution}
          onResolutionChange={setResolution}
          search={{ query: searchQuery, isSearching, resultCount: searchCount, errorMessage: searchError }}
          onSearchQueryChange={handleSearchQueryChange}
          onSearchSubmit={handleSearch}
          rectCount={rects.length}
          isProcessing={isProcessing}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar - Desktop (Fixed left) */}
        <aside className="hidden md:flex w-24 flex-shrink-0 border-r-4 border-slate-950 bg-white overflow-y-auto">
            <ThumbnailSidebar
              pages={pages}
              rects={rects}
              currentPage={currentPage}
              onPageSelect={handlePageSelect}
          />
        </aside>

        {/* Sidebar - Mobile (Overlay/Drawer) */}
        {showMobileSidebar && (
          <>
            <div 
              className="md:hidden fixed inset-0 bg-slate-950/40 z-30 transition-opacity"
              onClick={() => setShowMobileSidebar(false)}
            />
            <aside className="md:hidden fixed left-0 top-0 bottom-0 w-24 bg-white border-r-4 border-slate-950 z-40 overflow-y-auto animate-in slide-in-from-left duration-200">
              <div className="p-2 border-b-2 border-slate-950 bg-[#ccff00] text-[9px] font-black uppercase text-center mb-2">
                PÁGINAS
              </div>
            <ThumbnailSidebar
              pages={pages}
              rects={rects}
              currentPage={currentPage}
              onPageSelect={(idx) => {
                  handlePageSelect(idx);
                  setShowMobileSidebar(false);
                }}
              />
            </aside>
          </>
        )}

        {/* Main Canvas Area - Scrollable */}
        <main className="flex-1 overflow-auto p-4 md:p-8 no-scrollbar">
          <div
            style={{ width: `${zoom}%`, minWidth: "100%" }}
            className={`flex flex-col gap-8 select-none max-w-5xl mx-auto ${drawing ? "touch-none" : "touch-pan-y"}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setDrawing(null)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => setDrawing(null)}
          >
            {pages.map((page, pageIdx) => (
              <PageCanvas
                key={pageIdx}
                page={page}
                pageIdx={pageIdx}
                rects={rectsByPage.get(pageIdx) ?? EMPTY_RECTS}
                drawing={currentDrawingPage === pageIdx ? drawing : null}
                isProcessing={isProcessing}
                onRegisterRef={registerPageRef}
                onStartMouseDown={handleMouseDown}
                onStartTouchStart={handleTouchStart}
                onRemoveRect={removeRect}
              />
            ))}
          </div>
        </main>

        {/* Mobile FAB - To open pages menu */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="md:hidden fixed bottom-6 left-6 w-12 h-12 bg-[#ccff00] border-4 border-slate-950 shadow-[4px_4px_0px_#000] flex items-center justify-center z-20 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                title="Ver páginas"
              >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
            <rect x="3" y="3" width="18" height="18" rx="0" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </button>

      </div>
    </div>
  )
}
