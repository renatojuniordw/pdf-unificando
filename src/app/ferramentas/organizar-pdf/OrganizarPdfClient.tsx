"use client";
import Image from "next/image";
import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DropZone } from "@/components/upload/DropZone";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { RetryCountdown } from "@/components/processing/RetryCountdown";
import { DownloadButton } from "@/components/processing/DownloadButton";
import { PromotionBanner } from "@/components/tools/PromotionBanner";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { usePdfPages } from "@/hooks/usePdfPages";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

interface PageItem {
  id: string;
  index: number;
  dataUrl: string;
  removed: boolean;
}

const toPageItems = (pages: { index: number; dataUrl: string }[]): PageItem[] =>
  pages.map((p) => ({
    id: `page-${p.index}`,
    index: p.index,
    dataUrl: p.dataUrl,
    removed: false,
  }));

function SortablePage({
  item,
  onRemove,
}: {
  item: PageItem;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative border-4 border-slate-950 ${isDragging ? "opacity-0" : ""} ${item.removed ? "opacity-30" : ""}`}
    >
      <Image
        src={item.dataUrl}
        alt={`Página ${item.index + 1}`}
        width={240}
        height={320}
        className="w-full h-auto"
        unoptimized
      />
      <div className="absolute top-1 left-1 bg-slate-950 text-[#ccff00] text-[9px] font-black px-1.5 py-0.5 uppercase">
        {item.index + 1}
      </div>
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 right-8 bg-white border-2 border-slate-950 p-0.5 cursor-grab"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="2" width="2" height="2" />
          <rect x="5" y="2" width="2" height="2" />
          <rect x="8" y="2" width="2" height="2" />
          <rect x="2" y="5" width="2" height="2" />
          <rect x="5" y="5" width="2" height="2" />
          <rect x="8" y="5" width="2" height="2" />
          <rect x="2" y="8" width="2" height="2" />
          <rect x="5" y="8" width="2" height="2" />
          <rect x="8" y="8" width="2" height="2" />
        </svg>
      </button>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-[#ff4d4d] text-white border-2 border-slate-950 p-0.5 font-black text-[10px]"
      >
        ✕
      </button>
    </div>
  );
}

export function OrganizarPdfClient() {
  const { loading, loadFile } = usePdfPages();
  const [items, setItems] = useState<PageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const {
    status,
    error,
    downloadUrl,
    outputName,
    processedSize,
    process,
    reset,
    secondsLeft,
    progress,
  } = useFileProcessor({
    endpoint: "/api/pdf/organize",
    toolName: "organizar-pdf",
    outputFilename: (name) => name.replace(".pdf", "-organizado.pdf"),
  });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const handleDragStart = useCallback(
    (e: DragStartEvent) => setActiveId(e.active.id as string),
    [],
  );
  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oi = prev.findIndex((i) => i.id === active.id);
      const ni = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oi, ni);
    });
  }, []);

  const handleDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setOriginalFile(file);
      const loadedPages = await loadFile(file);
      setItems(toPageItems(loadedPages));
    },
    [loadFile],
  );

  const activeItem = items.find((i) => i.id === activeId);

  const handleProcess = useCallback(() => {
    if (!originalFile) return;
    const order = items
      .filter((i) => !i.removed)
      .map((i) => i.index)
      .join(",");
    process(originalFile, { order });
  }, [process, items, originalFile]);

  const handleReset = useCallback(() => {
    reset();
    setItems([]);
    setOriginalFile(null);
  }, [reset]);

  return (
    <div className="flex flex-col gap-6">
      {status === "idle" && items.length === 0 && !loading && (
        <div className="max-w-2xl mx-auto w-full">
          <DropZone
            accept={{ "application/pdf": [".pdf"] }}
            onDrop={handleDrop}
          />
        </div>
      )}
      {loading && (
        <div className="max-w-2xl mx-auto w-full">
          <ProcessingStatus status="processing" />
        </div>
      )}
      {items.length > 0 && status === "idle" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              {items.filter((i) => !i.removed).length} PÁGINAS ATIVAS
            </p>
            <button
              onClick={handleProcess}
              className="bg-slate-950 text-[#ccff00] border-4 border-slate-950 shadow-[4px_4px_0px_#ccff00] px-6 py-3 font-black uppercase tracking-widest text-xs hover:bg-slate-800 hover:-translate-y-1 transition-all"
            >
              REORGANIZAR PDF
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map((item) => (
                  <SortablePage
                    key={item.id}
                    item={item}
                    onRemove={() =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.id === item.id
                            ? { ...i, removed: !i.removed }
                            : i,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeItem && (
                <div className="border-4 border-[#ccff00] shadow-[4px_4px_0px_#ccff00]">
                  <Image
                    src={activeItem.dataUrl}
                    alt=""
                    width={96}
                    height={128}
                    className="w-24 h-auto"
                    unoptimized
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
      {(status === "uploading" || status === "processing") && (
        <div className="max-w-2xl mx-auto w-full">
          <ProcessingStatus status={status} />
        </div>
      )}
      {status === "rate_limited" && (
        <div className="max-w-2xl mx-auto w-full">
          <RetryCountdown
            secondsLeft={secondsLeft}
            progress={progress}
            onRetry={handleReset}
          />
        </div>
      )}
      {status === "error" && (
        <div className="max-w-2xl mx-auto w-full bg-[#ff4d4d] text-white border-4 border-slate-950 shadow-[4px_4px_0px_#000] p-6 flex items-center gap-4">
          <p className="font-black uppercase tracking-widest text-sm">
            ERRO: {error}
          </p>
          <button
            onClick={handleReset}
            className="ml-auto border-2 border-white px-4 py-2 font-black uppercase text-xs"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      )}
      {status === "done" && downloadUrl && (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          <DownloadButton
            url={downloadUrl}
            filename={outputName!}
            toolName="organizar-pdf"
            fileSize={processedSize}
            onReset={handleReset}
          />
          <PromotionBanner />
        </div>
      )}
    </div>
  );
}
