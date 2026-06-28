"use client"

import { useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist/types/src/display/api"
import { cn } from "@/lib/utils"
import type { PageInfo, Placement } from "../types"
import { PlacementBox } from "./PlacementBox"

interface PdfPageViewProps {
    doc: PDFDocumentProxy
    pageInfo: PageInfo
    pageIndex: number
    scale: number
    placements: Placement[]
    selectedId: string | null
    placingActive: boolean
    onPlaceAt: (pageIndex: number, point: { xRatio: number; yRatio: number }) => void
    onSelect: (id: string | null) => void
    onChange: (id: string, patch: Partial<Placement>) => void
    onRemove: (id: string) => void
}

/** One PDF page: lazily rendered to a canvas, with placement boxes overlaid. */
export function PdfPageView({
    doc,
    pageInfo,
    pageIndex,
    scale,
    placements,
    selectedId,
    placingActive,
    onPlaceAt,
    onSelect,
    onChange,
    onRemove,
}: PdfPageViewProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [visible, setVisible] = useState(false)

    const widthPx = pageInfo.width * scale
    const heightPx = pageInfo.height * scale

    useEffect(() => {
        const element = wrapperRef.current
        if (!element || visible) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: "500px 0px" },
        )
        observer.observe(element)
        return () => observer.disconnect()
    }, [visible])

    useEffect(() => {
        if (!visible) return
        let cancelled = false
        let task: RenderTask | null = null

        const render = async () => {
            try {
                const page = await doc.getPage(pageInfo.pageNumber)
                if (cancelled) return
                const viewport = page.getViewport({ scale })
                const canvas = canvasRef.current
                const context = canvas?.getContext("2d")
                if (!canvas || !context) return
                canvas.width = Math.max(1, Math.floor(viewport.width))
                canvas.height = Math.max(1, Math.floor(viewport.height))
                task = page.render({ canvas, canvasContext: context, viewport })
                await task.promise
            } catch (error) {
                if ((error as { name?: string })?.name === "RenderingCancelledException") return
            }
        }

        void render()
        return () => {
            cancelled = true
            try {
                task?.cancel()
            } catch {
                // no-op
            }
        }
    }, [visible, doc, pageInfo.pageNumber, scale])

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!placingActive) {
            onSelect(null)
            return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        onPlaceAt(pageIndex, {
            xRatio: (event.clientX - rect.left) / rect.width,
            yRatio: (event.clientY - rect.top) / rect.height,
        })
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                ref={wrapperRef}
                onClick={handleClick}
                className={cn(
                    "relative shrink-0 overflow-hidden rounded-lg border border-border bg-white shadow-sm",
                    placingActive ? "cursor-crosshair" : "",
                )}
                style={{ width: widthPx, height: heightPx }}
            >
                <canvas ref={canvasRef} className="block" />

                {placements.map((placement) => (
                    <PlacementBox
                        key={placement.id}
                        placement={placement}
                        pageWidthPx={widthPx}
                        pageHeightPx={heightPx}
                        selected={placement.id === selectedId}
                        onSelect={() => onSelect(placement.id)}
                        onChange={(patch) => onChange(placement.id, patch)}
                        onRemove={() => onRemove(placement.id)}
                    />
                ))}
            </div>
            <span className="text-xs text-muted-foreground">Page {pageInfo.pageNumber}</span>
        </div>
    )
}
