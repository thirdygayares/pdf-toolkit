"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type { CompareResult, CompareSide } from "../types"
import { CompareToolbar } from "./CompareToolbar"
import { ComparePane } from "./ComparePane"
import { DiffSummary } from "./DiffSummary"

interface CompareWorkspaceProps {
    result: CompareResult
    docs: { left: PDFDocumentProxy; right: PDFDocumentProxy }
    onReset: () => void
}

const ZOOM_MIN = 0.4
const ZOOM_MAX = 3
const ZOOM_STEP = 0.15
const DEFAULT_SCALE = 1

/**
 * The side-by-side review surface. Mounted only once a comparison is ready, so its
 * view state (zoom, scroll sync, active diff) resets cleanly for each comparison.
 */
export function CompareWorkspace({ result, docs, onReset }: CompareWorkspaceProps) {
    const [scale, setScale] = useState(DEFAULT_SCALE)
    const [scrollSync, setScrollSync] = useState(true)
    const [activeDiffIndex, setActiveDiffIndex] = useState(0)

    const leftScrollRef = useRef<HTMLDivElement | null>(null)
    const rightScrollRef = useRef<HTMLDivElement | null>(null)
    const syncingRef = useRef(false)

    const setLeftScroll = useCallback((element: HTMLDivElement | null) => {
        leftScrollRef.current = element
    }, [])
    const setRightScroll = useCallback((element: HTMLDivElement | null) => {
        rightScrollRef.current = element
    }, [])

    const handleScroll = useCallback(
        (from: CompareSide) => {
            if (!scrollSync || syncingRef.current) return
            const source = from === "left" ? leftScrollRef.current : rightScrollRef.current
            const target = from === "left" ? rightScrollRef.current : leftScrollRef.current
            if (!source || !target) return

            syncingRef.current = true
            const sourceMax = source.scrollHeight - source.clientHeight
            const targetMax = target.scrollHeight - target.clientHeight
            const ratio = sourceMax > 0 ? source.scrollTop / sourceMax : 0
            target.scrollTop = ratio * targetMax
            requestAnimationFrame(() => {
                syncingRef.current = false
            })
        },
        [scrollSync],
    )

    const goToPage = useCallback((pageNumber: number) => {
        syncingRef.current = true
        for (const container of [leftScrollRef.current, rightScrollRef.current]) {
            if (!container) continue
            const target = container.querySelector(`[data-page="${pageNumber}"]`) as HTMLElement | null
            if (target) {
                container.scrollTop = Math.max(0, target.offsetTop - 16)
            }
        }
        requestAnimationFrame(() => {
            syncingRef.current = false
        })
    }, [])

    const diffPageNumbers = useMemo(
        () => result.pairs.filter((pair) => pair.hasDiff).map((pair) => pair.pageNumber),
        [result],
    )

    const jumpToDiff = useCallback(
        (direction: 1 | -1) => {
            if (diffPageNumbers.length === 0) return
            setActiveDiffIndex((current) => {
                const next = (current + direction + diffPageNumbers.length) % diffPageNumbers.length
                goToPage(diffPageNumbers[next])
                return next
            })
        },
        [diffPageNumbers, goToPage],
    )

    const zoomIn = useCallback(() => setScale((value) => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2)))), [])
    const zoomOut = useCallback(() => setScale((value) => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2)))), [])

    const activeDiffLabel =
        diffPageNumbers.length > 0
            ? `Diff ${activeDiffIndex + 1}/${diffPageNumbers.length} · p.${diffPageNumbers[activeDiffIndex]}`
            : ""

    return (
        <section className="space-y-3">
            <CompareToolbar
                scale={scale}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                scrollSync={scrollSync}
                onScrollSyncChange={setScrollSync}
                diffPageCount={diffPageNumbers.length}
                activeDiffLabel={activeDiffLabel}
                onPrevDiff={() => jumpToDiff(-1)}
                onNextDiff={() => jumpToDiff(1)}
                onReset={onReset}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                <DiffSummary
                    summary={result.summary}
                    leftPageCount={result.leftPageCount}
                    rightPageCount={result.rightPageCount}
                />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-sm bg-danger/40 outline outline-1 outline-danger/50" />
                        Removed
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-sm bg-success/40 outline outline-1 outline-success/50" />
                        Added
                    </span>
                </div>
            </div>

            <div className="flex h-[calc(100vh-16rem)] min-h-[480px] gap-3">
                <ComparePane
                    side="left"
                    fileName={result.leftName}
                    pageCount={result.leftPageCount}
                    doc={docs.left}
                    pairs={result.pairs}
                    scale={scale}
                    containerRef={setLeftScroll}
                    onScroll={() => handleScroll("left")}
                />
                <ComparePane
                    side="right"
                    fileName={result.rightName}
                    pageCount={result.rightPageCount}
                    doc={docs.right}
                    pairs={result.pairs}
                    scale={scale}
                    containerRef={setRightScroll}
                    onScroll={() => handleScroll("right")}
                />
            </div>
        </section>
    )
}
