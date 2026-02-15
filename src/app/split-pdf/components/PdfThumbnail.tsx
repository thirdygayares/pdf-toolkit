"use client"

import { memo, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"
import { GripVertical } from "lucide-react"

interface PdfThumbnailProps {
    doc: PDFDocumentProxy
    pageNumber: number
    pageIndex: number
    selected: boolean
    onToggle: (index: number) => void
    width?: number
    dragHandleProps?: DraggableProvidedDragHandleProps | null
    sourceLabel?: string
    sourcePageNumber?: number
}

const PdfThumbnailComponent = ({
    doc,
    pageNumber,
    pageIndex,
    selected,
    onToggle,
    width = 220,
    dragHandleProps,
    sourceLabel,
    sourcePageNumber,
}: PdfThumbnailProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        let cancelled = false

        ;(async () => {
            try {
                const page = await doc.getPage(pageNumber)
                if (cancelled) return

                const viewport = page.getViewport({ scale: 1 })
                const scale = width / viewport.width
                const dpr = Math.min(window.devicePixelRatio || 1, 2)
                const nextViewport = page.getViewport({ scale: scale * dpr })

                const canvas = canvasRef.current
                if (!canvas) return

                const context = canvas.getContext("2d")
                if (!context) return

                canvas.width = Math.floor(nextViewport.width)
                canvas.height = Math.floor(nextViewport.height)
                canvas.style.width = `${Math.floor(nextViewport.width / dpr)}px`
                canvas.style.height = `${Math.floor(nextViewport.height / dpr)}px`

                const task = page.render({ canvasContext: context, viewport: nextViewport })
                await task.promise
            } catch (error) {
                console.error(`Thumbnail render failed for page ${pageNumber}`, error)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [doc, pageNumber, width])

    const placeholderHeight = Math.round(width * (4 / 3))

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-background transition-colors",
                selected ? "border-primary ring-2 ring-primary/70" : "border-border/80 hover:border-primary/40",
            )}
        >
            <button
                type="button"
                {...dragHandleProps}
                className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-background/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground active:cursor-grabbing"
                aria-label={`Reorder page ${pageNumber}`}
            >
                <GripVertical className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => onToggle(pageIndex)}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                aria-pressed={selected}
                aria-label={`Toggle page ${pageNumber}`}
            >
                <div className="relative">
                    <div className="flex w-full justify-center bg-muted" style={{ height: placeholderHeight }}>
                        <canvas ref={canvasRef} className="block" />
                    </div>
                    <div className={cn("absolute right-11 top-3 h-3.5 w-3.5 rounded-full shadow", selected ? "bg-primary" : "bg-muted-foreground/30")} />
                    <div className="absolute left-2 top-2">
                        <span
                            className={cn(
                                "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-xs font-semibold",
                                selected ? "bg-primary text-primary-foreground" : "border border-border/70 bg-background/95 text-foreground",
                            )}
                        >
                            {pageNumber}
                        </span>
                    </div>
                </div>
                <div className="border-t border-border/70 px-3 py-2">
                    <p className="text-sm text-foreground">Page {pageNumber}</p>
                    {sourceLabel && (
                        <p className="truncate text-xs text-muted-foreground" title={sourceLabel}>
                            {sourceLabel}
                            {sourcePageNumber ? ` • p${sourcePageNumber}` : ""}
                        </p>
                    )}
                </div>
            </button>
        </div>
    )
}

export const PdfThumbnail = memo(PdfThumbnailComponent)
