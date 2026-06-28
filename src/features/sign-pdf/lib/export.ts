"use client"

/**
 * Flattens placed signatures into the PDF with pdf-lib and triggers a download.
 *
 * Placements are stored as top-left ratios of the page; pdf-lib uses a
 * bottom-left origin, so we convert Y accordingly.
 */

import { PDFDocument } from "pdf-lib"
import type { Placement } from "../types"

function dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(",")[1] ?? ""
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
}

export async function exportSignedPdf(file: File, placements: Placement[], filename: string): Promise<void> {
    const inputBytes = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(inputBytes)
    const pages = pdfDoc.getPages()

    // Cache embedded images so repeated placements of the same asset reuse one image.
    const embedded = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedPng>>>()

    for (const placement of placements) {
        const page = pages[placement.pageIndex]
        if (!page) continue

        let image = embedded.get(placement.dataUrl)
        if (!image) {
            image = await pdfDoc.embedPng(dataUrlToBytes(placement.dataUrl))
            embedded.set(placement.dataUrl, image)
        }

        const pageWidth = page.getWidth()
        const pageHeight = page.getHeight()
        const drawWidth = placement.wRatio * pageWidth
        const drawHeight = placement.hRatio * pageHeight
        const x = placement.xRatio * pageWidth
        // Convert top-left ratio to bottom-left PDF coordinates.
        const y = pageHeight - placement.yRatio * pageHeight - drawHeight

        page.drawImage(image, { x, y, width: drawWidth, height: drawHeight })
    }

    const outBytes = await pdfDoc.save()
    // Copy into a fresh ArrayBuffer so the Blob part is unambiguously typed.
    const copy = new Uint8Array(outBytes)
    triggerDownload(new Blob([copy.buffer], { type: "application/pdf" }), filename)
}
