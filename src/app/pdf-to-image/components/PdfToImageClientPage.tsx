"use client"

import { useCallback, useEffect, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import JSZipType from "jszip"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { PageSelectionHeader } from "@/app/split-pdf/components/PageSelectionHeader"
import { SelectionToolBar } from "@/app/split-pdf/components/SelectionToolBar"
import { SplitGrid } from "@/app/split-pdf/components/SplitGrid"
import { useSplitPdf } from "@/app/split-pdf/hooks/useSplitPdf"
import type { UploadedFile } from "@/hooks/useFileUpload"
import { toTimestamp } from "@/lib/toTimestamp"
import { useWarnBeforeCloseRefresh } from "@/hooks/useWarnBeforeCloseRefresh"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { PdfToImageHero } from "./PdfToImageHero"
import { PagePreviewDialog } from "./PagePreviewDialog"

type OutputFormat = "png" | "jpg"
type DpiPreset = 72 | 300
type PdfModule = typeof import("pdfjs-dist/build/pdf")

let cachedPdfModule: PdfModule | null = null

const loadPdfModule = async (): Promise<PdfModule> => {
    if (cachedPdfModule) {
        return cachedPdfModule
    }
    const pdfJsModule = await import("pdfjs-dist/build/pdf")
    pdfJsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
    cachedPdfModule = pdfJsModule
    return pdfJsModule
}

const sanitizeBaseName = (name: string) => {
    const base = name.replace(/\.pdf$/i, "").trim()
    const normalized = base.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")
    return normalized || "document"
}

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
}

const toBlob = (canvas: HTMLCanvasElement, mime: string, quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Failed to build image blob."))
                    return
                }
                resolve(blob)
            },
            mime,
            quality,
        )
    })

const parseCustomRange = (raw: string, pageCount: number): number[] => {
    if (pageCount <= 0) {
        throw new Error("Upload at least one PDF first.")
    }

    const input = raw.trim()
    if (!input) {
        throw new Error("Enter a range like 1-10.")
    }

    const tokens = input
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)

    if (tokens.length === 0) {
        throw new Error("Invalid range. Use 1-10 or 1, 3, 7.")
    }

    const selected = new Set<number>()
    for (const token of tokens) {
        const match = /^(\d+)(?:-(\d+))?$/.exec(token)
        if (!match) {
            throw new Error(`Invalid token "${token}". Use 1-10 or 1, 3, 7.`)
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

    return Array.from(selected).sort((a, b) => a - b)
}

export default function PdfToImageClientPage() {
    const { state, loadPdfs, clearAll, toggle, setAll, invert, setCheckedPages, reorderPages, includedCount } = useSplitPdf()
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [columns, setColumns] = useState<1 | 2 | 3 | 4 | 5>(2)
    const [customRange, setCustomRange] = useState("")
    const [customRangeError, setCustomRangeError] = useState<string | null>(null)
    const [format, setFormat] = useState<OutputFormat>("png")
    const [dpi, setDpi] = useState<DpiPreset>(300)
    const [jpgQuality, setJpgQuality] = useState(80)
    const [converting, setConverting] = useState(false)
    const [progressCurrent, setProgressCurrent] = useState(0)
    const [progressTotal, setProgressTotal] = useState(0)
    const [convertError, setConvertError] = useState<string | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewPage, setPreviewPage] = useState<number | null>(null)
    const [previewDoc, setPreviewDoc] = useState<PDFDocumentProxy | null>(null)

    const progressPercent = progressTotal > 0 ? Math.round((progressCurrent / progressTotal) * 100) : 0
    const qualityLabel = jpgQuality >= 90 ? "High" : jpgQuality >= 70 ? "Medium" : "Low"
    const singleOutput = includedCount === 1
    const shouldWarnBeforeRefresh = uploadedFiles.length > 0 || state.pageCount > 0 || converting

    useWarnBeforeCloseRefresh(
        shouldWarnBeforeRefresh,
        "You have unsaved PDF-to-image changes. Refreshing or closing will lose your current progress.",
    )

    useEffect(() => {
        if (uploadedFiles.length === 0) {
            clearAll()
            return
        }
        void loadPdfs(uploadedFiles.map((item) => item.file))
    }, [uploadedFiles, loadPdfs, clearAll])

    const handleReset = useCallback(() => {
        setUploadedFiles([])
        setPreviewOpen(false)
        setPreviewPage(null)
        setPreviewDoc(null)
        setCustomRange("")
        setCustomRangeError(null)
        setConvertError(null)
        setConverting(false)
        setProgressCurrent(0)
        setProgressTotal(0)
        clearAll()
    }, [clearAll])

    const handleSetAll = useCallback(
        (value: boolean) => {
            setCustomRangeError(null)
            setAll(value)
        },
        [setAll],
    )

    const handleInvert = useCallback(() => {
        setCustomRangeError(null)
        invert()
    }, [invert])

    const handleToggle = useCallback(
        (index: number) => {
            setCustomRangeError(null)
            toggle(index)
        },
        [toggle],
    )

    const handleApplyCustomRange = useCallback(() => {
        try {
            const pages = parseCustomRange(customRange, state.pageCount)
            setCheckedPages(pages)
            setCustomRangeError(null)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid custom range."
            setCustomRangeError(message)
        }
    }, [customRange, setCheckedPages, state.pageCount])

    const handleConvert = useCallback(async () => {
        if (!state.file) {
            setConvertError("Please upload at least one PDF.")
            return
        }

        const selectedIndexes = state.order.filter((index) => state.checked[index])
        if (selectedIndexes.length === 0) {
            setConvertError("Select at least one page to convert.")
            return
        }

        setConvertError(null)
        setConverting(true)
        setProgressCurrent(0)
        setProgressTotal(selectedIndexes.length)

        const extension = format === "png" ? "png" : "jpg"
        const mime = format === "png" ? "image/png" : "image/jpeg"
        const quality = jpgQuality / 100
        const padLength = Math.max(2, String(state.pageCount).length)
        const scale = dpi / 72
        const baseName = sanitizeBaseName(state.file.name)
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        if (!context) {
            setConvertError("Unable to initialize canvas context.")
            setConverting(false)
            return
        }

        try {
            const pdfModule = await loadPdfModule()
            const bytes = await state.file.arrayBuffer()
            const task = pdfModule.getDocument({ data: bytes })
            const doc = await task.promise

            const total = selectedIndexes.length
            const multiple = total > 1
            const zip = multiple
                ? new ((await import("jszip")) as unknown as { default: typeof JSZipType }).default()
                : null

            for (let i = 0; i < total; i += 1) {
                const pageIndex = selectedIndexes[i]
                const pageNumber = pageIndex + 1
                const page = await doc.getPage(pageNumber)
                const viewport = page.getViewport({ scale })

                canvas.width = Math.max(1, Math.floor(viewport.width))
                canvas.height = Math.max(1, Math.floor(viewport.height))

                await page.render({ canvasContext: context, viewport }).promise

                const blob = await toBlob(canvas, mime, format === "jpg" ? quality : undefined)
                const name = `${baseName}_page_${String(pageNumber).padStart(padLength, "0")}.${extension}`

                if (zip) {
                    zip.file(name, blob)
                } else {
                    triggerDownload(blob, name)
                }

                setProgressCurrent(i + 1)
            }

            if (zip) {
                const zipBlob = await zip.generateAsync({ type: "blob" })
                triggerDownload(zipBlob, `${baseName}_pages_${toTimestamp()}.zip`)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to convert selected pages."
            setConvertError(message)
        } finally {
            canvas.width = 0
            canvas.height = 0
            setConverting(false)
            setProgressCurrent(0)
            setProgressTotal(0)
        }
    }, [dpi, format, jpgQuality, state.checked, state.file, state.order, state.pageCount])

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-5xl space-y-7 sm:space-y-10">
                    <UploadSingle files={uploadedFiles} onFilesChange={setUploadedFiles} busy={state.busy} onReset={handleReset} />
                    {uploadedFiles.length === 0 && <PdfToImageHero />}
                </section>

                {(state.error || convertError) && (
                    <div className="mx-auto mt-5 max-w-5xl rounded-lg border border-destructive/25 bg-destructive/10 p-4">
                        <div className="text-destructive">
                            <span className="font-medium">{state.error || convertError}</span>
                        </div>
                    </div>
                )}

                {state.pageCount > 0 && state.file && (
                    <section className="mx-auto max-w-6xl py-8 pb-28 sm:py-10 sm:pb-32">
                        <Card className="rounded-2xl border-border/80 shadow-sm">
                            <CardHeader className="pb-2">
                                <PageSelectionHeader state={state} includedCount={includedCount} columns={columns} />
                            </CardHeader>
                            <CardContent>
                                <SelectionToolBar
                                    setAll={handleSetAll}
                                    invert={handleInvert}
                                    columns={columns}
                                    setColumns={setColumns}
                                    customRange={customRange}
                                    onCustomRangeChange={(value) => {
                                        setCustomRange(value)
                                        if (customRangeError) {
                                            setCustomRangeError(null)
                                        }
                                    }}
                                    onApplyCustomRange={handleApplyCustomRange}
                                    customRangeError={customRangeError}
                                    customRangePlaceholder={`1-${Math.min(10, Math.max(1, state.pageCount))}, 12-15`}
                                />

                                <div className="mb-5 grid gap-5 rounded-xl border border-border/70 bg-surface/45 p-3.5 sm:grid-cols-2 sm:p-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="output-format">Output format</Label>
                                        <select
                                            id="output-format"
                                            value={format}
                                            onChange={(event) => setFormat(event.target.value === "jpg" ? "jpg" : "png")}
                                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        >
                                            <option value="png">PNG (best for charts/text)</option>
                                            <option value="jpg">JPG (smaller file size)</option>
                                        </select>

                                        {format === "jpg" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="jpg-quality">JPG quality ({qualityLabel})</Label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        id="jpg-quality"
                                                        type="range"
                                                        min={40}
                                                        max={100}
                                                        step={1}
                                                        value={jpgQuality}
                                                        onChange={(event) => setJpgQuality(Number.parseInt(event.target.value, 10))}
                                                        className="w-full accent-primary"
                                                    />
                                                    <Badge variant="secondary" className="min-w-14 justify-center">
                                                        {jpgQuality}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Resolution</Label>
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" variant={dpi === 72 ? "default" : "outline"} onClick={() => setDpi(72)}>
                                                Screen (72 DPI)
                                            </Button>
                                            <Button size="sm" variant={dpi === 300 ? "default" : "outline"} onClick={() => setDpi(300)}>
                                                Print (300 DPI)
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Tip: use the zoom icon on a page card to preview text readability before converting.
                                        </p>
                                    </div>

                                    {converting && (
                                        <div className="sm:col-span-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
                                            <p className="text-sm font-medium text-foreground">
                                                Processing page {Math.max(1, progressCurrent)} of {progressTotal}...
                                            </p>
                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/15">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-[width] duration-200"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <SplitGrid
                                    file={state.file}
                                    pageCount={state.pageCount}
                                    checked={state.checked}
                                    order={state.order}
                                    pageOrigins={state.pageOrigins}
                                    onToggle={handleToggle}
                                    onReorder={reorderPages}
                                    columns={columns}
                                    onPreview={(pageNumber) => {
                                        setPreviewPage(pageNumber)
                                        setPreviewOpen(true)
                                    }}
                                    onDocumentReady={setPreviewDoc}
                                />
                            </CardContent>
                        </Card>

                        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-6 sm:px-4 sm:pb-4">
                            <div className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Selected <span className="font-semibold text-foreground">{includedCount}</span> of{" "}
                                        <span className="font-semibold text-foreground">{state.pageCount}</span> pages •{" "}
                                        {singleOutput ? "Download 1 image" : "Download as ZIP"}
                                    </p>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2.5">
                                        <Button
                                            className="h-10 rounded-lg px-5 text-sm font-semibold"
                                            onClick={() => void handleConvert()}
                                            disabled={converting || includedCount === 0}
                                        >
                                            {converting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Converting...
                                                </>
                                            ) : (
                                                "Convert & download"
                                            )}
                                        </Button>
                                        <Button variant="outline" className="h-10 rounded-lg px-4 text-sm" onClick={handleReset} disabled={converting}>
                                            Start over
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />

            <PagePreviewDialog
                doc={previewDoc}
                pageNumber={previewPage}
                open={previewOpen}
                onOpenChange={(nextOpen) => {
                    setPreviewOpen(nextOpen)
                    if (!nextOpen) {
                        setPreviewPage(null)
                    }
                }}
            />
        </div>
    )
}
