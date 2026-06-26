"use client"

import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ComparePagePair, CompareSide } from "../types"
import { ComparePage } from "./ComparePage"

interface ComparePaneProps {
    side: CompareSide
    fileName: string
    pageCount: number
    doc: PDFDocumentProxy | null
    pairs: ComparePagePair[]
    scale: number
    containerRef: (element: HTMLDivElement | null) => void
    onScroll: () => void
}

const SIDE_LABEL: Record<CompareSide, string> = {
    left: "Original",
    right: "Revised",
}

const SIDE_ACCENT: Record<CompareSide, string> = {
    left: "border-danger/30 bg-danger/5 text-danger",
    right: "border-success/30 bg-success/5 text-success",
}

/** One column of the comparison: a sticky file header above a scrollable page list. */
export function ComparePane({
    side,
    fileName,
    pageCount,
    doc,
    pairs,
    scale,
    containerRef,
    onScroll,
}: ComparePaneProps) {
    return (
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-surface/60 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    <Badge variant="outline" className={SIDE_ACCENT[side]}>
                        {SIDE_LABEL[side]}
                    </Badge>
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground" title={fileName}>
                        {fileName}
                    </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{pageCount} pages</span>
            </div>

            <div
                ref={containerRef}
                onScroll={onScroll}
                className="relative flex-1 overflow-auto bg-muted/40"
            >
                <div className="flex w-fit min-w-full flex-col items-center gap-4 p-4">
                    {pairs.map((pair) => {
                        const view = side === "left" ? pair.left : pair.right
                        const counterpart = side === "left" ? pair.right : pair.left
                        return (
                            <ComparePage
                                key={pair.pageNumber}
                                side={side}
                                doc={doc}
                                pageNumber={pair.pageNumber}
                                view={view}
                                scale={scale}
                                counterpartHeight={counterpart?.height ?? null}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
