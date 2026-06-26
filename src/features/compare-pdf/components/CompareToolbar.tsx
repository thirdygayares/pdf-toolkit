"use client"

import { ChevronDown, ChevronUp, Link2, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CompareToolbarProps {
    scale: number
    onZoomIn: () => void
    onZoomOut: () => void
    scrollSync: boolean
    onScrollSyncChange: (value: boolean) => void
    diffPageCount: number
    activeDiffLabel: string
    onPrevDiff: () => void
    onNextDiff: () => void
    onReset: () => void
}

/** Sticky control bar: scroll-sync toggle, zoom, diff navigation, and reset. */
export function CompareToolbar({
    scale,
    onZoomIn,
    onZoomOut,
    scrollSync,
    onScrollSyncChange,
    diffPageCount,
    activeDiffLabel,
    onPrevDiff,
    onNextDiff,
    onReset,
}: CompareToolbarProps) {
    const hasDiffs = diffPageCount > 0

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
            <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <Label htmlFor="compare-scroll-sync" className="cursor-pointer text-sm">
                    Scroll sync
                </Label>
                <Switch id="compare-scroll-sync" checked={scrollSync} onCheckedChange={onScrollSyncChange} />
            </div>

            <div className="flex items-center gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={onPrevDiff}
                    disabled={!hasDiffs}
                >
                    <ChevronUp className="h-4 w-4" />
                    Prev
                </Button>
                <span className="min-w-[7.5rem] text-center text-xs font-medium text-muted-foreground">
                    {hasDiffs ? activeDiffLabel : "No differences"}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2"
                    onClick={onNextDiff}
                    disabled={!hasDiffs}
                >
                    Next
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1.5">
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={onZoomOut} aria-label="Zoom out">
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="w-14 text-center text-xs font-medium tabular-nums text-muted-foreground">
                    {Math.round(scale * 100)}%
                </span>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={onZoomIn} aria-label="Zoom in">
                    <ZoomIn className="h-4 w-4" />
                </Button>

                <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5" onClick={onReset}>
                    <RefreshCw className="h-4 w-4" />
                    New comparison
                </Button>
            </div>
        </div>
    )
}
