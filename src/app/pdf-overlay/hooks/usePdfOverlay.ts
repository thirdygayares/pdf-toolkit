"use client"

import { useState } from "react"
import { PDFDocument } from "pdf-lib"
import { UploadedFile } from "@/hooks/useFileUpload"

export type OverlayTargetPagesMode = "all" | "first" | "odd" | "even" | "custom"
export type OverlaySourcePageMode = "first" | "match" | "cycle"
export type OverlayPlacementMode = "fit" | "fill" | "original" | "stretch"
export type OverlayAlignX = "left" | "center" | "right"
export type OverlayAlignY = "top" | "center" | "bottom"

export interface OverlayOptions {
    opacity: number
    targetPages: OverlayTargetPagesMode
    customRange: string
    overlaySourceMode: OverlaySourcePageMode
    placementMode: OverlayPlacementMode
    scalePercent: number
    alignX: OverlayAlignX
    alignY: OverlayAlignY
    offsetXPt: number
    offsetYPt: number
}

export interface OverlayResult {
    base64: string
    mime: string
    originalName: string
    basePageCount: number
    overlayPageCount: number
    appliedPageCount: number
    skippedPageCount: number
    warnings: string[]
}

export const DEFAULT_OVERLAY_OPTIONS: OverlayOptions = {
    opacity: 0.5,
    targetPages: "all",
    customRange: "",
    overlaySourceMode: "first",
    placementMode: "fit",
    scalePercent: 100,
    alignX: "center",
    alignY: "center",
    offsetXPt: 0,
    offsetYPt: 0,
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const normalizeNumber = (value: number, fallback = 0) =>
    Number.isFinite(value) ? value : fallback

const parseCustomPageRange = (raw: string, pageCount: number): number[] => {
    const input = raw.trim()
    if (!input) {
        throw new Error("Enter a custom page range like 1-3, 7.")
    }

    const tokens = input
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)

    if (tokens.length === 0) {
        throw new Error("Invalid custom range. Use values like 1-3, 7.")
    }

    const selected = new Set<number>()
    for (const token of tokens) {
        const match = /^(\d+)(?:-(\d+))?$/.exec(token)
        if (!match) {
            throw new Error(`Invalid token "${token}". Use 1-3, 7.`)
        }

        const start = Number.parseInt(match[1], 10)
        const end = match[2] ? Number.parseInt(match[2], 10) : start
        if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
            throw new Error(`Range must be between 1 and ${pageCount}.`)
        }

        const from = Math.min(start, end)
        const to = Math.max(start, end)
        for (let page = from; page <= to; page += 1) {
            selected.add(page)
        }
    }

    return Array.from(selected)
        .sort((a, b) => a - b)
        .map((pageNumber) => pageNumber - 1)
}

const resolveTargetPageIndices = (basePageCount: number, options: OverlayOptions): number[] => {
    switch (options.targetPages) {
        case "all":
            return Array.from({ length: basePageCount }, (_, index) => index)
        case "first":
            return basePageCount > 0 ? [0] : []
        case "odd":
            return Array.from({ length: basePageCount }, (_, index) => index).filter((index) => (index + 1) % 2 === 1)
        case "even":
            return Array.from({ length: basePageCount }, (_, index) => index).filter((index) => (index + 1) % 2 === 0)
        case "custom":
            return parseCustomPageRange(options.customRange, basePageCount)
        default:
            return []
    }
}

const resolveOverlayPageIndex = (
    basePageIndex: number,
    overlayPageCount: number,
    mode: OverlaySourcePageMode,
): number | null => {
    if (overlayPageCount <= 0) return null

    if (mode === "first") {
        return 0
    }

    if (mode === "cycle") {
        return basePageIndex % overlayPageCount
    }

    return basePageIndex < overlayPageCount ? basePageIndex : null
}

const getAlignedAxis = (
    containerSize: number,
    itemSize: number,
    align: OverlayAlignX | OverlayAlignY,
): number => {
    if (align === "left" || align === "bottom") return 0
    if (align === "center") return (containerSize - itemSize) / 2
    return containerSize - itemSize
}

export function usePdfOverlay() {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const applyOverlay = async (
        baseFile: UploadedFile,
        overlayFile: UploadedFile,
        options: OverlayOptions
    ): Promise<OverlayResult | null> => {
        try {
            setBusy(true)
            setError(null)

            const baseBuffer = await baseFile.file.arrayBuffer()
            const overlayBuffer = await overlayFile.file.arrayBuffer()

            const basePdfDoc = await PDFDocument.load(baseBuffer)
            const overlayPdfDoc = await PDFDocument.load(overlayBuffer)

            const overlayPages = overlayPdfDoc.getPages()
            if (overlayPages.length === 0) {
                throw new Error("Overlay PDF has no pages")
            }
            const basePages = basePdfDoc.getPages()
            const basePageCount = basePages.length
            const overlayPageCount = overlayPages.length
            const warnings: string[] = []

            const targetPageIndices = resolveTargetPageIndices(basePageCount, options)
            if (targetPageIndices.length === 0) {
                throw new Error("No target pages selected. Adjust the page target setting.")
            }

            const overlayPageByBasePage = new Map<number, number>()
            let skippedPageCount = 0

            for (const basePageIndex of targetPageIndices) {
                const overlayPageIndex = resolveOverlayPageIndex(
                    basePageIndex,
                    overlayPageCount,
                    options.overlaySourceMode,
                )

                if (overlayPageIndex === null) {
                    skippedPageCount += 1
                    continue
                }

                overlayPageByBasePage.set(basePageIndex, overlayPageIndex)
            }

            if (overlayPageByBasePage.size === 0) {
                throw new Error("No pages were updated. Check the overlay page mapping and target range.")
            }

            if (skippedPageCount > 0 && options.overlaySourceMode === "match") {
                warnings.push(
                    `${skippedPageCount} target page${skippedPageCount === 1 ? "" : "s"} skipped because the overlay PDF has fewer pages in match mode.`,
                )
            }

            if (options.placementMode === "fill") {
                warnings.push("Fill mode may crop parts of the overlay to cover the full page.")
            }

            const uniqueOverlayPageIndices = Array.from(new Set(overlayPageByBasePage.values())).sort((a, b) => a - b)
            const embeddedOverlayPages = await basePdfDoc.embedPdf(overlayPdfDoc, uniqueOverlayPageIndices)
            const embeddedOverlayByIndex = new Map<number, (typeof embeddedOverlayPages)[number]>()
            uniqueOverlayPageIndices.forEach((overlayPageIndex, index) => {
                const embedded = embeddedOverlayPages[index]
                if (embedded) {
                    embeddedOverlayByIndex.set(overlayPageIndex, embedded)
                }
            })

            const opacity = clamp(normalizeNumber(options.opacity, DEFAULT_OVERLAY_OPTIONS.opacity), 0.05, 1)
            const scaleMultiplier = clamp(
                normalizeNumber(options.scalePercent, DEFAULT_OVERLAY_OPTIONS.scalePercent),
                10,
                300,
            ) / 100
            const offsetX = clamp(normalizeNumber(options.offsetXPt, 0), -2000, 2000)
            const offsetY = clamp(normalizeNumber(options.offsetYPt, 0), -2000, 2000)

            overlayPageByBasePage.forEach((overlayPageIndex, basePageIndex) => {
                const page = basePages[basePageIndex]
                const embeddedOverlay = embeddedOverlayByIndex.get(overlayPageIndex)
                if (!page || !embeddedOverlay) return

                const { width, height } = page.getSize()
                const safeOverlayWidth = Math.max(1, embeddedOverlay.width)
                const safeOverlayHeight = Math.max(1, embeddedOverlay.height)

                let drawWidth = safeOverlayWidth
                let drawHeight = safeOverlayHeight

                if (options.placementMode === "fit") {
                    const scale = Math.min(width / safeOverlayWidth, height / safeOverlayHeight)
                    drawWidth = safeOverlayWidth * scale
                    drawHeight = safeOverlayHeight * scale
                } else if (options.placementMode === "fill") {
                    const scale = Math.max(width / safeOverlayWidth, height / safeOverlayHeight)
                    drawWidth = safeOverlayWidth * scale
                    drawHeight = safeOverlayHeight * scale
                } else if (options.placementMode === "stretch") {
                    drawWidth = width
                    drawHeight = height
                }

                drawWidth *= scaleMultiplier
                drawHeight *= scaleMultiplier

                const x = getAlignedAxis(width, drawWidth, options.alignX) + offsetX
                const y = getAlignedAxis(height, drawHeight, options.alignY) + offsetY

                page.drawPage(embeddedOverlay, {
                    x,
                    y,
                    width: drawWidth,
                    height: drawHeight,
                    opacity,
                })
            })

            const pdfBytes = await basePdfDoc.saveAsBase64({ dataUri: true })
            const baseOut = pdfBytes.split(",")[1] || pdfBytes

            return {
                base64: baseOut,
                mime: "application/pdf",
                originalName: baseFile.name,
                basePageCount,
                overlayPageCount,
                appliedPageCount: overlayPageByBasePage.size,
                skippedPageCount,
                warnings,
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to apply overlay")
            return null
        } finally {
            setBusy(false)
        }
    }

    return {
        applyOverlay,
        busy,
        error,
    }
}
