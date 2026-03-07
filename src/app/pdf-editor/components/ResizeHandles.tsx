"use client"

import type { ResizeDirection } from "@/app/pdf-editor/lib/types"
import { cn } from "@/lib/utils"

const HANDLE_POSITIONS: { direction: ResizeDirection; className: string; cursor: string }[] = [
  { direction: "nw", className: "-top-1 -left-1", cursor: "nw-resize" },
  { direction: "n", className: "-top-1 left-1/2 -translate-x-1/2", cursor: "n-resize" },
  { direction: "ne", className: "-top-1 -right-1", cursor: "ne-resize" },
  { direction: "e", className: "top-1/2 -right-1 -translate-y-1/2", cursor: "e-resize" },
  { direction: "se", className: "-bottom-1 -right-1", cursor: "se-resize" },
  { direction: "s", className: "-bottom-1 left-1/2 -translate-x-1/2", cursor: "s-resize" },
  { direction: "sw", className: "-bottom-1 -left-1", cursor: "sw-resize" },
  { direction: "w", className: "top-1/2 -left-1 -translate-y-1/2", cursor: "w-resize" },
]

interface ResizeHandlesProps {
  onResizeStart: (direction: ResizeDirection, event: React.PointerEvent<HTMLElement>) => void
}

export function ResizeHandles({ onResizeStart }: ResizeHandlesProps) {
  return (
    <>
      {HANDLE_POSITIONS.map(({ direction, className, cursor }) => (
        <div
          key={direction}
          className={cn(
            "absolute z-20 size-3 rounded-full border-2 border-primary bg-white shadow-sm",
            "hover:scale-125 transition-transform",
            className,
          )}
          style={{ cursor, touchAction: "none" }}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onResizeStart(direction, e)
          }}
        />
      ))}
    </>
  )
}

export function computeResizedBounds(
  original: { x: number; y: number; width: number; height: number },
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  maintainAspect: boolean,
) {
  let { x, y, width, height } = original
  const minSize = 0.02

  switch (direction) {
    case "e":
      width = Math.max(minSize, original.width + deltaX)
      break
    case "w":
      width = Math.max(minSize, original.width - deltaX)
      x = original.x + original.width - width
      break
    case "s":
      height = Math.max(minSize, original.height + deltaY)
      break
    case "n":
      height = Math.max(minSize, original.height - deltaY)
      y = original.y + original.height - height
      break
    case "se":
      width = Math.max(minSize, original.width + deltaX)
      height = Math.max(minSize, original.height + deltaY)
      break
    case "sw":
      width = Math.max(minSize, original.width - deltaX)
      x = original.x + original.width - width
      height = Math.max(minSize, original.height + deltaY)
      break
    case "ne":
      width = Math.max(minSize, original.width + deltaX)
      height = Math.max(minSize, original.height - deltaY)
      y = original.y + original.height - height
      break
    case "nw":
      width = Math.max(minSize, original.width - deltaX)
      x = original.x + original.width - width
      height = Math.max(minSize, original.height - deltaY)
      y = original.y + original.height - height
      break
  }

  if (maintainAspect && original.width > 0 && original.height > 0) {
    const aspectRatio = original.width / original.height
    if (direction === "e" || direction === "w") {
      height = width / aspectRatio
    } else if (direction === "n" || direction === "s") {
      width = height * aspectRatio
    } else {
      const newAspect = width / height
      if (newAspect > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }
    }
  }

  // Clamp to valid range
  x = Math.max(0, Math.min(x, 1 - minSize))
  y = Math.max(0, Math.min(y, 1 - minSize))
  width = Math.max(minSize, Math.min(width, 1 - x))
  height = Math.max(minSize, Math.min(height, 1 - y))

  return { x, y, width, height }
}
