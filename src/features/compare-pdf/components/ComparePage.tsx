"use client"

import { useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist/types/src/display/api"
import { FileX2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComparePageView, CompareSide } from "../types"

interface ComparePageProps {
    side: CompareSide
    doc: PDFDocumentProxy | null
    pageNumber: number
    view: ComparePageView | null
    scale: number
    /** Height (scale-1.0) of the matching page on the other side, for placeholder sizing. */
    counterpartHeight: number | null
}

/**
 * Renders one PDF page to a canvas (lazily, once it scrolls near the viewport) and
 * overlays semi-transparent highlight boxes for added/removed text runs.
 *
 * Geometry is stored at scale 1.0, so every box is multiplied by the active zoom.
 */
export function ComparePage({ side, doc, pageNumber, view, scale, counterpartHeight }: ComparePageProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [visible, setVisible] = useState(false)
    const [rendering, setRendering] = useState(false)
    const [renderError, setRenderError] = useState<string | null>(null)

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
            { rootMargin: "400px 0px" },
        )
        observer.observe(element)
        return () => observer.disconnect()
    }, [visible])

    useEffect(() => {
        if (!visible || !doc || !view) return

        let cancelled = false
        let task: RenderTask | null = null

        const render = async () => {
            setRendering(true)
            setRenderError(null)
            try {
                const page = await doc.getPage(pageNumber)
                if (cancelled) return
                const viewport = page.getViewport({ scale })
                const canvas = canvasRef.current
                const context = canvas?.getContext("2d")
                if (!canvas || !context) return

                canvas.width = Math.max(1, Math.floor(viewport.width))
                canvas.height = Math.max(1, Math.floor(viewport.height))

                task = page.render({ canvas, canvasContext: context, viewport })
                await task.promise
                if (!cancelled) {
                    setRendering(false)
                }
            } catch (error) {
                if (cancelled) return
                // A cancelled render throws RenderingCancelledException — ignore it.
                const name = (error as { name?: string })?.name
                if (name === "RenderingCancelledException") return
                setRenderError(error instanceof Error ? error.message : "Failed to render page.")
                setRendering(false)
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
    }, [visible, doc, view, pageNumber, scale])

    const placeholderHeight = (view?.height ?? counterpartHeight ?? 800) * scale
    const placeholderWidth = (view?.width ?? 600) * scale

    if (!view) {
        return (
            <div
                ref={wrapperRef}
                data-page={pageNumber}
                className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/40 text-center"
                style={{ width: placeholderWidth, height: placeholderHeight, minHeight: 160 }}
            >
                <FileX2 className="h-7 w-7 text-muted-foreground" />
                <p className="px-4 text-xs font-medium text-muted-foreground">
                    No page {pageNumber} in the {side === "left" ? "original" : "revised"} PDF
                </p>
            </div>
        )
    }

    const highlights = view.runs.filter((run) => run.status !== "equal")

    return (
        <div
            ref={wrapperRef}
            data-page={pageNumber}
            className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-white shadow-sm"
            style={{ width: view.width * scale, height: view.height * scale }}
        >
            <canvas ref={canvasRef} className="block" />

            {/* Diff highlight overlay (positions are scaled from stored scale-1.0 boxes). */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                {highlights.map((run, index) => (
                    <span
                        key={`${run.status}-${index}`}
                        className={cn(
                            "absolute rounded-[2px] mix-blend-multiply",
                            run.status === "added"
                                ? "bg-success/35 outline outline-1 outline-success/50"
                                : "bg-danger/35 outline outline-1 outline-danger/50",
                        )}
                        style={{
                            left: run.box.x * scale,
                            top: run.box.y * scale,
                            width: run.box.w * scale,
                            height: run.box.h * scale,
                        }}
                    />
                ))}
            </div>

            {rendering ? (
                <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-white/70 py-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rendering…
                </div>
            ) : null}

            {renderError ? (
                <div className="absolute inset-x-0 bottom-0 bg-danger/10 px-2 py-1 text-center text-xs text-danger">
                    {renderError}
                </div>
            ) : null}

            <span className="absolute right-1.5 top-1.5 rounded bg-foreground/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {pageNumber}
            </span>
        </div>
    )
}
