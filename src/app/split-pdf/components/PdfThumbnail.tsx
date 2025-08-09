"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"

interface PdfThumbnailProps {
    doc: PDFDocumentProxy
    pageNumber: number
    selected: boolean
    onToggle: () => void
    width?: number
}

export function PdfThumbnail({ doc, pageNumber, selected, onToggle, width = 220 }: PdfThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const page = await doc.getPage(pageNumber)

                const viewport = page.getViewport({ scale: 1 })
                const scale = width / viewport.width
                const dpr = Math.min(window.devicePixelRatio || 1, 2)
                const v2 = page.getViewport({ scale: scale * dpr })

                const canvas = canvasRef.current!
                if (!canvas) return
                const ctx = canvas.getContext("2d")!
                canvas.width = Math.floor(v2.width)
                canvas.height = Math.floor(v2.height)
                canvas.style.width = `${Math.floor(v2.width / dpr)}px`
                canvas.style.height = `${Math.floor(v2.height / dpr)}px`

                const task = page.render({ canvasContext: ctx, viewport: v2 })
                await task.promise
            } catch (e) {
                console.error(`Thumb render failed (page ${pageNumber})`, e)
            }
        })()
        return () => { cancelled = true }
    }, [doc, pageNumber, width])

    // Give the holder an initial height so the layout is stable
    const placeholderH = Math.round(width * (4 / 3))

    return (
        <div
            className={cn(
                "group relative border rounded-lg overflow-hidden bg-background transition-all",
                selected ? "ring-2 ring-primary border-primary/40" : "hover:border-primary/30",
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-pressed={selected}
                aria-label={`Toggle Page ${pageNumber}`}
            >
                <div className="relative">
                    <div className="w-full flex justify-center bg-muted" style={{ height: placeholderH }}>
                        <canvas ref={canvasRef} className="block" />
                    </div>

                    <div
                        className={cn(
                            "absolute top-2 right-2 w-3 h-3 rounded-full shadow",
                            selected ? "bg-primary" : "bg-muted-foreground/30",
                        )}
                    />
                    <div className="absolute top-2 left-2">
            <span
                className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded text-xs font-semibold",
                    selected ? "bg-primary text-primary-foreground" : "bg-background/90 border",
                )}
            >
              {pageNumber}
            </span>
                    </div>
                </div>
                <div className="px-3 py-2 border-t text-sm">Page {pageNumber}</div>
            </button>
        </div>
    )
}
