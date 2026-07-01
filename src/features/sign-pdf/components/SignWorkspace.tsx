"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import { Download, Loader2, Plus, RefreshCw, Trash2, ZoomIn, ZoomOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PageInfo, Placement, SignatureAsset } from "../types"
import { PdfPageView } from "./PdfPageView"
import { SignatureModal } from "./SignatureModal"

interface SignWorkspaceProps {
    fileName: string
    doc: PDFDocumentProxy
    pages: PageInfo[]
    placements: Placement[]
    exporting: boolean
    addPlacement: (asset: SignatureAsset, pageIndex: number, point?: { xRatio: number; yRatio: number }) => string
    updatePlacement: (id: string, patch: Partial<Placement>) => void
    removePlacement: (id: string) => void
    clearPlacements: () => void
    exportPdf: () => void
    onReset: () => void
}

const ZOOM_MIN = 0.4
const ZOOM_MAX = 2.5
const ZOOM_STEP = 0.15

export function SignWorkspace({
    fileName,
    doc,
    pages,
    placements,
    exporting,
    addPlacement,
    updatePlacement,
    removePlacement,
    clearPlacements,
    exportPdf,
    onReset,
}: SignWorkspaceProps) {
    const [scale, setScale] = useState(1)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [assets, setAssets] = useState<SignatureAsset[]>([])
    const [armedAssetId, setArmedAssetId] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const scrollRef = useRef<HTMLDivElement | null>(null)

    const placingActive = armedAssetId !== null

    /** The page whose center is nearest the viewport center (drop target for centered adds). */
    const getCurrentPageIndex = useCallback(() => {
        const container = scrollRef.current
        if (!container) return 0
        const elements = Array.from(container.querySelectorAll<HTMLElement>("[data-page-index]"))
        const mid = container.getBoundingClientRect().top + container.clientHeight / 2
        let best = 0
        let bestDist = Infinity
        for (const element of elements) {
            const rect = element.getBoundingClientRect()
            const center = rect.top + rect.height / 2
            const dist = Math.abs(center - mid)
            if (dist < bestDist) {
                bestDist = dist
                best = Number(element.dataset.pageIndex)
            }
        }
        return best
    }, [])

    const handleApply = useCallback(
        (asset: SignatureAsset) => {
            setAssets((prev) => [...prev, asset])
            const id = addPlacement(asset, getCurrentPageIndex())
            setSelectedId(id)
        },
        [addPlacement, getCurrentPageIndex],
    )

    const handlePlaceAt = useCallback(
        (pageIndex: number, point: { xRatio: number; yRatio: number }) => {
            if (!armedAssetId) return
            const asset = assets.find((item) => item.id === armedAssetId)
            if (!asset) return
            const id = addPlacement(asset, pageIndex, point)
            setSelectedId(id)
            setArmedAssetId(null)
        },
        [armedAssetId, assets, addPlacement],
    )

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setArmedAssetId(null)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const zoomIn = () => setScale((value) => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2))))
    const zoomOut = () => setScale((value) => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2))))

    return (
        <section className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <Button type="button" onClick={() => setModalOpen(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add signature
                    </Button>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                        {placements.length} placed
                    </Badge>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={zoomOut} aria-label="Zoom out">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-xs font-medium tabular-nums text-muted-foreground">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={zoomIn} aria-label="Zoom in">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-1.5">
                    {placements.length > 0 ? (
                        <Button type="button" variant="ghost" size="sm" className="h-8" onClick={clearPlacements}>
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Clear
                        </Button>
                    ) : null}
                    <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onReset}>
                        <RefreshCw className="mr-1.5 h-4 w-4" />
                        Start over
                    </Button>
                    <Button type="button" className="h-8" onClick={exportPdf} disabled={placements.length === 0 || exporting}>
                        {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                        Download signed PDF
                    </Button>
                </div>
            </div>

            {/* Signature tray */}
            {assets.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">Your marks:</span>
                    {assets.map((asset) => (
                        <button
                            key={asset.id}
                            type="button"
                            onClick={() => setArmedAssetId((current) => (current === asset.id ? null : asset.id))}
                            className={cn(
                                "flex h-10 items-center rounded-md border bg-white px-2 transition",
                                armedAssetId === asset.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
                            )}
                            title="Click, then click on a page to place"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset.dataUrl} alt={asset.kind} className="max-h-8 max-w-[120px] object-contain" />
                        </button>
                    ))}
                    {placingActive ? (
                        <Badge className="border-primary/30 bg-primary/10 text-primary">Click on a page to place · Esc to cancel</Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground">Click a mark, then click on the page to place it again.</span>
                    )}
                </div>
            ) : null}

            {/* Page viewer */}
            <div ref={scrollRef} className="h-[calc(100vh-17rem)] min-h-[460px] overflow-auto rounded-xl border border-border bg-muted/40">
                <div className="flex flex-col items-center gap-6 p-4">
                    <p className="truncate text-xs text-muted-foreground" title={fileName}>
                        {fileName}
                    </p>
                    {pages.map((pageInfo, index) => (
                        <div key={pageInfo.pageNumber} data-page-index={index}>
                            <PdfPageView
                                doc={doc}
                                pageInfo={pageInfo}
                                pageIndex={index}
                                scale={scale}
                                placements={placements.filter((placement) => placement.pageIndex === index)}
                                selectedId={selectedId}
                                placingActive={placingActive}
                                onPlaceAt={handlePlaceAt}
                                onSelect={setSelectedId}
                                onChange={updatePlacement}
                                onRemove={removePlacement}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <SignatureModal open={modalOpen} onOpenChange={setModalOpen} onApply={handleApply} />
        </section>
    )
}
