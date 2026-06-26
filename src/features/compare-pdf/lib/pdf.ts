"use client"

/**
 * pdf.js access for the compare feature: a cached module loader, a document
 * loader, and per-page text geometry extraction (positioned text runs at
 * scale 1.0). The worker is served locally from /pdf.worker.min.mjs and is
 * kept in sync with the installed pdfjs-dist version by scripts/copy-pdf-worker.mjs.
 */

import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type { TextItem } from "pdfjs-dist/types/src/display/api"
import type { RunBox } from "../types"

type PdfModule = typeof import("pdfjs-dist/build/pdf")
type PdfModuleWithUtil = PdfModule & {
    Util: { transform: (m1: number[], m2: number[]) => number[] }
}

let cachedModule: PdfModuleWithUtil | null = null

export async function loadPdfModule(): Promise<PdfModuleWithUtil> {
    if (cachedModule) {
        return cachedModule
    }
    // The local pdfjs-dist/build/pdf module declaration only types the bits we
    // use elsewhere, so widen through `unknown` to reach Util.transform.
    const mod = (await import("pdfjs-dist/build/pdf")) as unknown as PdfModuleWithUtil
    mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
    cachedModule = mod
    return mod
}

export async function loadDocument(file: File): Promise<PDFDocumentProxy> {
    const mod = await loadPdfModule()
    const data = await file.arrayBuffer()
    return await mod.getDocument({ data }).promise
}

export interface RawRun {
    text: string
    box: RunBox
}

export interface PageGeometry {
    width: number
    height: number
    runs: RawRun[]
}

/**
 * Extract positioned text runs for a single page at scale 1.0.
 *
 * Each pdf.js text item carries a transform in PDF user space; we compose it with
 * the viewport transform to get device pixels, then build an axis-aligned box from
 * the baseline origin, the run width, and the font height.
 */
export async function extractPageGeometry(doc: PDFDocumentProxy, pageNumber: number): Promise<PageGeometry> {
    const mod = await loadPdfModule()
    const page = await doc.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 1 })
    const textContent = await page.getTextContent()

    const runs: RawRun[] = []
    for (const item of textContent.items) {
        if (!("str" in item)) {
            continue
        }
        const textItem = item as TextItem
        if (!textItem.str || !textItem.str.trim()) {
            continue
        }

        const tx = mod.Util.transform(viewport.transform, textItem.transform)
        const fontHeight = Math.hypot(tx[2], tx[3]) || textItem.height || 0
        const width = textItem.width || 0
        if (fontHeight <= 0 || width <= 0) {
            continue
        }

        runs.push({
            text: textItem.str,
            box: {
                x: tx[4],
                y: tx[5] - fontHeight,
                w: width,
                h: fontHeight,
            },
        })
    }

    try {
        page.cleanup()
    } catch {
        // no-op: cleanup is best-effort
    }

    return { width: viewport.width, height: viewport.height, runs }
}
