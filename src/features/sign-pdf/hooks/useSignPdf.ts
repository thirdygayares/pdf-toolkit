"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type { PageInfo, Placement, SignatureAsset } from "../types"
import { getPageInfos, loadDocument } from "../lib/pdf"
import { exportSignedPdf } from "../lib/export"

export type SignStatus = "idle" | "loading" | "ready" | "exporting" | "error"

export interface SignPdfState {
    status: SignStatus
    error: string | null
    fileName: string | null
    doc: PDFDocumentProxy | null
    pages: PageInfo[]
    placements: Placement[]
}

const INITIAL_STATE: SignPdfState = {
    status: "idle",
    error: null,
    fileName: null,
    doc: null,
    pages: [],
    placements: [],
}

const MAX_FILE_BYTES = 100 * 1024 * 1024

let placementCounter = 0
const nextId = (prefix: string) => {
    placementCounter += 1
    return `${prefix}-${placementCounter}`
}

async function destroyDoc(doc: PDFDocumentProxy | null) {
    if (!doc) return
    try {
        await doc.destroy()
    } catch {
        // no-op
    }
}

/** Default on-page size for a freshly dropped mark, as a ratio of page width. */
const DEFAULT_WIDTH_RATIO = 0.28

/**
 * Owns the Sign-PDF lifecycle: load the PDF and page dimensions, keep the live
 * document proxy for rendering, and manage placed signatures + export.
 */
export function useSignPdf() {
    const [state, setState] = useState<SignPdfState>(INITIAL_STATE)
    const docRef = useRef<PDFDocumentProxy | null>(null)
    const fileRef = useRef<File | null>(null)
    const placementsRef = useRef<Placement[]>([])
    const exportingRef = useRef(false)

    useEffect(() => {
        placementsRef.current = state.placements
    }, [state.placements])

    useEffect(() => {
        return () => {
            void destroyDoc(docRef.current)
            docRef.current = null
        }
    }, [])

    const loadFile = useCallback(async (file: File) => {
        if (file.size > MAX_FILE_BYTES) {
            setState({
                ...INITIAL_STATE,
                status: "error",
                error: `The PDF must be ${Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB or smaller.`,
            })
            return
        }

        await destroyDoc(docRef.current)
        docRef.current = null
        fileRef.current = file
        setState({ ...INITIAL_STATE, status: "loading", fileName: file.name })

        try {
            const doc = await loadDocument(file)
            const pages = await getPageInfos(doc)
            docRef.current = doc
            setState({ status: "ready", error: null, fileName: file.name, doc, pages, placements: [] })
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to open the PDF."
            setState({ ...INITIAL_STATE, status: "error", error: message })
        }
    }, [])

    /** Drop an asset onto a page. Defaults to centered near the top if no point given. Returns the new placement id. */
    const addPlacement = useCallback(
        (asset: SignatureAsset, pageIndex: number, point?: { xRatio: number; yRatio: number }): string => {
            const id = nextId("place")
            setState((prev) => {
                const page = prev.pages[pageIndex]
                if (!page) return prev

                const aspect = asset.height > 0 ? asset.width / asset.height : 3
                const wRatio = DEFAULT_WIDTH_RATIO
                // Keep visual aspect: hRatio derived so on-page pixels match the image ratio.
                const hRatio = (wRatio * page.width) / aspect / page.height

                const xRatio = point ? clamp(point.xRatio - wRatio / 2, 0, 1 - wRatio) : (1 - wRatio) / 2
                const yRatio = point ? clamp(point.yRatio - hRatio / 2, 0, 1 - hRatio) : 0.08

                const placement: Placement = {
                    id,
                    assetId: asset.id,
                    dataUrl: asset.dataUrl,
                    pageIndex,
                    xRatio,
                    yRatio,
                    wRatio,
                    hRatio,
                    aspect,
                }
                return { ...prev, placements: [...prev.placements, placement] }
            })
            return id
        },
        [],
    )

    const updatePlacement = useCallback((id: string, patch: Partial<Placement>) => {
        setState((prev) => ({
            ...prev,
            placements: prev.placements.map((placement) => (placement.id === id ? { ...placement, ...patch } : placement)),
        }))
    }, [])

    const removePlacement = useCallback((id: string) => {
        setState((prev) => ({ ...prev, placements: prev.placements.filter((placement) => placement.id !== id) }))
    }, [])

    const clearPlacements = useCallback(() => {
        setState((prev) => ({ ...prev, placements: [] }))
    }, [])

    const exportPdf = useCallback(async () => {
        const file = fileRef.current
        const placements = placementsRef.current
        if (!file || placements.length === 0 || exportingRef.current) return

        exportingRef.current = true
        setState((prev) => ({ ...prev, status: "exporting", error: null }))
        try {
            const base = file.name.replace(/\.pdf$/i, "") || "document"
            await exportSignedPdf(file, placements, `${base}-signed.pdf`)
            setState((prev) => ({ ...prev, status: "ready" }))
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to export the signed PDF."
            setState((prev) => ({ ...prev, status: "ready", error: message }))
        } finally {
            exportingRef.current = false
        }
    }, [])

    const reset = useCallback(() => {
        void destroyDoc(docRef.current)
        docRef.current = null
        fileRef.current = null
        setState(INITIAL_STATE)
    }, [])

    return { state, loadFile, addPlacement, updatePlacement, removePlacement, clearPlacements, exportPdf, reset }
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
