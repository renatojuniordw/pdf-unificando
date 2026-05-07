import type { DrawingRect } from "./types"

export function getNormalized(d: DrawingRect) {
  return {
    x: Math.min(d.startX, d.currentX),
    y: Math.min(d.startY, d.currentY),
    w: Math.abs(d.currentX - d.startX),
    h: Math.abs(d.currentY - d.startY),
  }
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
