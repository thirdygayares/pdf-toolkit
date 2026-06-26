/**
 * Shared types for the side-by-side PDF comparison feature.
 *
 * Geometry (boxes, page width/height) is always stored at scale 1.0. The render
 * layer multiplies by the active zoom so we never have to recompute text
 * positions when the user zooms in or out.
 */

export type CompareSide = "left" | "right"

/** Status of a single text run after diffing the two documents. */
export type RunStatus = "equal" | "added" | "removed"

/** Axis-aligned box for a text run, in scale-1.0 pixels, top-left origin. */
export interface RunBox {
    x: number
    y: number
    w: number
    h: number
}

/** A single text run (word/line fragment) with its position and diff status. */
export interface PageRun {
    text: string
    box: RunBox
    status: RunStatus
}

/** A rendered/diffed page on one side of the comparison. */
export interface ComparePageView {
    pageNumber: number
    /** Page width at scale 1.0. */
    width: number
    /** Page height at scale 1.0. */
    height: number
    runs: PageRun[]
    /** Number of added/removed runs on this page (this side). */
    changeCount: number
}

/** A page slot shared by both documents (aligned by page number). */
export interface ComparePagePair {
    pageNumber: number
    left: ComparePageView | null
    right: ComparePageView | null
    /** True when this page differs (text added or removed) or exists on one side only. */
    hasDiff: boolean
    /** Total added + removed runs across both sides. */
    changeCount: number
}

export interface CompareSummary {
    totalPages: number
    pagesWithDiff: number
    added: number
    removed: number
    /** True when both documents have identical page count and no text differences. */
    identical: boolean
}

export interface CompareResult {
    leftName: string
    rightName: string
    leftPageCount: number
    rightPageCount: number
    pairs: ComparePagePair[]
    summary: CompareSummary
}
