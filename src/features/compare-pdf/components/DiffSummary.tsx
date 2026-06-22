"use client"

import { CheckCircle2, FileStack, Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CompareSummary } from "../types"

interface DiffSummaryProps {
    summary: CompareSummary
    leftPageCount: number
    rightPageCount: number
}

/** Compact roll-up of the comparison plus the highlight-colour legend. */
export function DiffSummary({ summary, leftPageCount, rightPageCount }: DiffSummaryProps) {
    const pageCountMismatch = leftPageCount !== rightPageCount

    return (
        <div className="flex flex-wrap items-center gap-2">
            {summary.identical ? (
                <Badge className="border-success/35 bg-success/15 text-success">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Documents are identical
                </Badge>
            ) : (
                <Badge variant="outline" className="border-warning/35 bg-warning/10 text-warning">
                    {summary.pagesWithDiff} of {summary.totalPages} page{summary.totalPages === 1 ? "" : "s"} differ
                </Badge>
            )}

            <Badge variant="outline" className="border-success/30 bg-success/5 text-success">
                <Plus className="mr-1 h-3.5 w-3.5" />
                {summary.added} added
            </Badge>
            <Badge variant="outline" className="border-danger/30 bg-danger/5 text-danger">
                <Minus className="mr-1 h-3.5 w-3.5" />
                {summary.removed} removed
            </Badge>

            {pageCountMismatch ? (
                <Badge variant="outline" className="text-muted-foreground">
                    <FileStack className="mr-1 h-3.5 w-3.5" />
                    {leftPageCount} vs {rightPageCount} pages
                </Badge>
            ) : null}
        </div>
    )
}
