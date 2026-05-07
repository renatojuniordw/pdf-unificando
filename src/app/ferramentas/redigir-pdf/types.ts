export type Rect = { id: string; page: number; x: number; y: number; w: number; h: number }
export type PageInfo = { image: string; width: number; height: number }
export type DrawingRect = { page: number; startX: number; startY: number; currentX: number; currentY: number }
export type Resolution = 72 | 144 | 216
