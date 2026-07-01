/**
 * Types for the Sign-PDF feature.
 *
 * Placements store position/size as ratios (0..1) of the page so they survive
 * zoom changes and translate cleanly to PDF points on export.
 */

/** The kind of mark being created (top tabs in the signature modal). */
export type MarkKind = "signature" | "initials" | "stamp"

/** How the mark is produced (left rail in the signature modal). */
export type InputMethod = "type" | "draw" | "upload"

/** Preset ink colors. */
export const SIGNATURE_COLORS = [
    { id: "black", value: "#1f2937" },
    { id: "red", value: "#dc2626" },
    { id: "blue", value: "#2563eb" },
    { id: "green", value: "#16a34a" },
] as const

/** A rasterized mark (transparent PNG) ready to be placed on the PDF. */
export interface SignatureAsset {
    id: string
    kind: MarkKind
    method: InputMethod
    /** Transparent PNG data URL. */
    dataUrl: string
    /** Natural pixel dimensions of the PNG. */
    width: number
    height: number
}

/** A single placed instance of an asset on a page. */
export interface Placement {
    id: string
    assetId: string
    /** Snapshot of the asset image, so the placement is self-contained. */
    dataUrl: string
    /** 0-based page index. */
    pageIndex: number
    /** Top-left position as a ratio of page width/height. */
    xRatio: number
    yRatio: number
    /** Size as a ratio of page width/height. */
    wRatio: number
    hRatio: number
    /** Image aspect ratio (width / height), used to keep proportions when resizing. */
    aspect: number
}

/** Page dimensions at scale 1.0 (== PDF points). */
export interface PageInfo {
    pageNumber: number
    width: number
    height: number
}
