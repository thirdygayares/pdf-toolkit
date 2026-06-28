"use client"

/**
 * pdf.js access for the Sign-PDF feature: cached module loader, document loader,
 * and per-page dimension extraction (at scale 1.0, which equals PDF points).
 *
 * The worker is served from /pdf.worker.min.mjs, kept in sync with the installed
 * pdfjs-dist by scripts/copy-pdf-worker.mjs.
 */

import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type { PageInfo } from "../types"

type PdfModule = typeof import("pdfjs-dist/build/pdf")

let cachedModule: PdfModule | null = null

export async function loadPdfModule(): Promise<PdfModule> {
    if (cachedModule) {
        return cachedModule
    }
    const mod = await import("pdfjs-dist/build/pdf")
    mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
    cachedModule = mod
    return mod
}

export async function loadDocument(file: File): Promise<PDFDocumentProxy> {
    const mod = await loadPdfModule()
    const data = await file.arrayBuffer()
    return await mod.getDocument({ data }).promise
}

/** Read every page's dimensions at scale 1.0 (PDF points). */
export async function getPageInfos(doc: PDFDocumentProxy): Promise<PageInfo[]> {
    const infos: PageInfo[] = []
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1 })
        infos.push({ pageNumber, width: viewport.width, height: viewport.height })
        try {
            page.cleanup()
        } catch {
            // no-op
        }
    }
    return infos
}
