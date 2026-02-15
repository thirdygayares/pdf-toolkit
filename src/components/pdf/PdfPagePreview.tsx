"use client"

import { cn } from "@/lib/utils"

type LayoutMode = "fit" | "fill" | "original"

interface PdfPagePreviewProps {
    imageUrl?: string | null
    imageWidth?: number
    imageHeight?: number
    rotation?: number
    pageWidthPt: number
    pageHeightPt: number
    marginPt: number
    backgroundColor: string
    layoutMode: LayoutMode
    className?: string
    emptyLabel?: string
}

const ORIGINAL_SCALE = 72 / 96

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const PdfPagePreview = ({
    imageUrl,
    imageWidth,
    imageHeight,
    rotation = 0,
    pageWidthPt,
    pageHeightPt,
    marginPt,
    backgroundColor,
    layoutMode,
    className,
    emptyLabel = "Upload images to see a live page preview.",
}: PdfPagePreviewProps) => {
    const pageW = Math.max(1, pageWidthPt)
    const pageH = Math.max(1, pageHeightPt)
    const margin = clamp(marginPt, 0, Math.min(pageW, pageH) / 2)
    const contentW = Math.max(1, pageW - margin * 2)
    const contentH = Math.max(1, pageH - margin * 2)
    const rotationMod = ((rotation % 360) + 360) % 360
    const rotated = rotationMod === 90 || rotationMod === 270
    const rawImageW = Math.max(1, imageWidth ?? 1)
    const rawImageH = Math.max(1, imageHeight ?? 1)
    const imageW = rotated ? rawImageH : rawImageW
    const imageH = rotated ? rawImageW : rawImageH

    let scale = 1
    if (layoutMode === "fit") {
        scale = Math.min(contentW / imageW, contentH / imageH)
    } else if (layoutMode === "fill") {
        scale = Math.max(contentW / imageW, contentH / imageH)
    } else {
        scale = ORIGINAL_SCALE
    }

    const drawW = Math.max(1, imageW * scale)
    const drawH = Math.max(1, imageH * scale)

    const marginXPct = (margin / pageW) * 100
    const marginYPct = (margin / pageH) * 100
    const drawWPct = (drawW / contentW) * 100
    const drawHPct = (drawH / contentH) * 100

    return (
        <div className={cn("rounded-2xl border border-border/80 bg-card p-4 shadow-sm", className)}>
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Live page preview</p>
                <p className="text-xs text-muted-foreground">Updates instantly with your settings</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-surface/50 p-4">
                <div className="mx-auto w-full max-w-md">
                    <div
                        className="relative overflow-hidden rounded-md border border-border/70 shadow-sm"
                        style={{
                            aspectRatio: `${pageW} / ${pageH}`,
                            backgroundColor,
                        }}
                    >
                        <div
                            className="absolute overflow-hidden"
                            style={{
                                left: `${marginXPct}%`,
                                right: `${marginXPct}%`,
                                top: `${marginYPct}%`,
                                bottom: `${marginYPct}%`,
                            }}
                        >
                            {imageUrl ? (
                                <div
                                    className="absolute left-1/2 top-1/2"
                                    style={{
                                        width: `${drawWPct}%`,
                                        height: `${drawHPct}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className={cn(
                                            "h-full w-full",
                                            layoutMode === "fill" ? "object-cover" : "object-contain",
                                        )}
                                        style={{ transform: `rotate(${rotationMod}deg)` }}
                                    />
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
                                    {emptyLabel}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
