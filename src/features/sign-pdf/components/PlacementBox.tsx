"use client"

import { useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Placement } from "../types"

interface PlacementBoxProps {
    placement: Placement
    pageWidthPx: number
    pageHeightPx: number
    selected: boolean
    onSelect: () => void
    onChange: (patch: Partial<Placement>) => void
    onRemove: () => void
}

const MIN_WIDTH_RATIO = 0.05

/** A signature instance on the page: drag to move, corner handle to resize. */
export function PlacementBox({
    placement,
    pageWidthPx,
    pageHeightPx,
    selected,
    onSelect,
    onChange,
    onRemove,
}: PlacementBoxProps) {
    const dragRef = useRef<{ pointerX: number; pointerY: number; xRatio: number; yRatio: number } | null>(null)
    const resizeRef = useRef<{ pointerX: number; widthPx: number } | null>(null)

    const leftPx = placement.xRatio * pageWidthPx
    const topPx = placement.yRatio * pageHeightPx
    const widthPx = placement.wRatio * pageWidthPx
    const heightPx = placement.hRatio * pageHeightPx

    const handleDragStart = (event: React.PointerEvent) => {
        if ((event.target as HTMLElement).dataset.role === "resize") return
        event.stopPropagation()
        event.preventDefault()
        onSelect()
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
        dragRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            xRatio: placement.xRatio,
            yRatio: placement.yRatio,
        }
    }

    const handleDragMove = (event: React.PointerEvent) => {
        const drag = dragRef.current
        if (!drag) return
        const dx = (event.clientX - drag.pointerX) / pageWidthPx
        const dy = (event.clientY - drag.pointerY) / pageHeightPx
        const xRatio = clamp(drag.xRatio + dx, 0, 1 - placement.wRatio)
        const yRatio = clamp(drag.yRatio + dy, 0, 1 - placement.hRatio)
        onChange({ xRatio, yRatio })
    }

    const handleDragEnd = (event: React.PointerEvent) => {
        dragRef.current = null
        try {
            ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
        } catch {
            // no-op
        }
    }

    const handleResizeStart = (event: React.PointerEvent) => {
        event.stopPropagation()
        event.preventDefault()
        onSelect()
        ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
        resizeRef.current = { pointerX: event.clientX, widthPx }
    }

    const handleResizeMove = (event: React.PointerEvent) => {
        const resize = resizeRef.current
        if (!resize) return
        const nextWidthPx = Math.max(MIN_WIDTH_RATIO * pageWidthPx, resize.widthPx + (event.clientX - resize.pointerX))
        let wRatio = nextWidthPx / pageWidthPx
        wRatio = Math.min(wRatio, 1 - placement.xRatio)
        const heightRatioPx = (wRatio * pageWidthPx) / placement.aspect
        let hRatio = heightRatioPx / pageHeightPx
        // Keep within the page bottom; if it would overflow, cap width via height.
        if (placement.yRatio + hRatio > 1) {
            hRatio = 1 - placement.yRatio
            wRatio = (hRatio * pageHeightPx * placement.aspect) / pageWidthPx
        }
        onChange({ wRatio, hRatio })
    }

    const handleResizeEnd = (event: React.PointerEvent) => {
        resizeRef.current = null
        try {
            ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
        } catch {
            // no-op
        }
    }

    return (
        <div
            className={cn(
                "group absolute cursor-move touch-none select-none rounded-sm",
                selected ? "outline outline-2 outline-primary" : "outline-dashed outline-1 outline-primary/40",
            )}
            style={{ left: leftPx, top: topPx, width: widthPx, height: heightPx }}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={placement.dataUrl} alt="Placed signature" className="pointer-events-none h-full w-full object-contain" draggable={false} />

            <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                    event.stopPropagation()
                    onRemove()
                }}
                className="absolute -right-2.5 -top-2.5 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow group-hover:flex"
                aria-label="Remove signature"
            >
                <X className="h-3 w-3" />
            </button>

            <span
                data-role="resize"
                onPointerDown={handleResizeStart}
                onPointerMove={handleResizeMove}
                onPointerUp={handleResizeEnd}
                className="absolute -bottom-1.5 -right-1.5 z-10 h-3.5 w-3.5 cursor-nwse-resize rounded-full border border-white bg-primary shadow"
                aria-label="Resize signature"
            />
        </div>
    )
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
