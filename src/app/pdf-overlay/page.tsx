"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PdfPreviewDialog } from "@/components/pdf/PdfPreviewDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeftRight, Eraser } from "lucide-react"

import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { UploadedFile } from "@/hooks/useFileUpload"
import { base64ToBlob } from "@/lib/base64ToBlob"
import { toTimestamp } from "@/lib/toTimestamp"

import { OverlayHero } from "./components/OverlayHero"
import { OverlayAction } from "./components/OverlayAction"
import { OverlayResultPanel } from "./components/OverlayResultPanel"
import {
    usePdfOverlay,
    OverlayResult,
    OverlayOptions,
    DEFAULT_OVERLAY_OPTIONS,
} from "./hooks/usePdfOverlay"

export default function PdfOverlayPage() {
    const { applyOverlay, busy, error } = usePdfOverlay()
    const [baseFiles, setBaseFiles] = useState<UploadedFile[]>([])
    const [overlayFiles, setOverlayFiles] = useState<UploadedFile[]>([])

    const [result, setResult] = useState<OverlayResult | null>(null)
    const [downloadFilename, setDownloadFilename] = useState("")
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewPdfUrl, setPreviewPdfUrl] = useState("")

    const [options, setOptions] = useState<OverlayOptions>({ ...DEFAULT_OVERLAY_OPTIONS })

    const clearPreviewUrl = () => {
        setPreviewPdfUrl((currentUrl) => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl)
            }
            return ""
        })
    }

    const invalidateResult = () => {
        setResult(null)
        setPreviewOpen(false)
        clearPreviewUrl()
    }

    const setOptionsWithInvalidate: Dispatch<SetStateAction<OverlayOptions>> = (nextState) => {
        setOptions((prev) =>
            typeof nextState === "function"
                ? (nextState as (prevState: OverlayOptions) => OverlayOptions)(prev)
                : nextState,
        )
        invalidateResult()
    }

    const handleResetBase = () => {
        setBaseFiles([])
        setDownloadFilename("")
        invalidateResult()
    }

    const handleResetOverlay = () => {
        setOverlayFiles([])
        invalidateResult()
    }

    const handleResetAll = () => {
        setBaseFiles([])
        setOverlayFiles([])
        setOptions({ ...DEFAULT_OVERLAY_OPTIONS })
        setDownloadFilename("")
        invalidateResult()
    }

    const buildDefaultFilename = (sourceName: string) => {
        const base = sourceName.replace(/\.pdf$/i, "").trim() || "document"
        return `${base}-overlaid-${toTimestamp()}`
    }

    const handleApply = async () => {
        if (!baseFiles.length || !overlayFiles.length) return

        const res = await applyOverlay(baseFiles[0], overlayFiles[0], options)
        if (!res) return

        setResult(res)
        setDownloadFilename(buildDefaultFilename(res.originalName))
    }

    const handleDownload = () => {
        if (!result) return

        const baseName = (downloadFilename.trim() || buildDefaultFilename(result.originalName))
            .replace(/\.pdf$/i, "")
            .trim()

        const blob = base64ToBlob(result.base64, result.mime)
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `${baseName || "overlaid-document"}.pdf`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
    }

    const handlePreviewOpen = () => {
        if (!result) return

        setPreviewPdfUrl((currentUrl) => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl)
            }
            const blob = base64ToBlob(result.base64, result.mime)
            return URL.createObjectURL(blob)
        })
        setPreviewOpen(true)
    }

    const handlePreviewOpenChange = (open: boolean) => {
        setPreviewOpen(open)
        if (!open) {
            clearPreviewUrl()
        }
    }

    const handleBaseFilesChange = (files: UploadedFile[]) => {
        setBaseFiles(files.slice(-1))
        setDownloadFilename("")
        invalidateResult()
    }

    const handleOverlayFilesChange = (files: UploadedFile[]) => {
        setOverlayFiles(files.slice(-1))
        invalidateResult()
    }

    const handleSwapFiles = () => {
        const base = baseFiles[0]
        const overlay = overlayFiles[0]
        if (!base || !overlay) return
        setBaseFiles([overlay])
        setOverlayFiles([base])
        setDownloadFilename("")
        invalidateResult()
    }

    const hasBothFiles = baseFiles.length > 0 && overlayFiles.length > 0
    const hasResult = Boolean(result)

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="container mx-auto px-4 py-8 sm:py-12 flex-1">
                <section className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
                    <OverlayHero />

                    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Workflow status</p>
                                <p className="text-xs text-muted-foreground">
                                    Upload base and overlay PDFs, configure placement, then preview and download.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSwapFiles}
                                    disabled={!hasBothFiles || busy}
                                >
                                    <ArrowLeftRight className="h-4 w-4" />
                                    Swap files
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetAll}
                                    disabled={busy || (!baseFiles.length && !overlayFiles.length)}
                                    className="text-muted-foreground"
                                >
                                    <Eraser className="h-4 w-4" />
                                    Clear setup
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant={baseFiles.length ? "default" : "secondary"} className="rounded-full">
                                Base PDF: {baseFiles.length ? "Ready" : "Pending"}
                            </Badge>
                            <Badge variant={overlayFiles.length ? "default" : "secondary"} className="rounded-full">
                                Overlay PDF: {overlayFiles.length ? "Ready" : "Pending"}
                            </Badge>
                            <Badge variant={hasResult ? "default" : "secondary"} className="rounded-full">
                                Result: {hasResult ? "Generated" : "Not generated"}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                        <div className="space-y-3">
                            <div className="px-1">
                                <p className="text-sm font-semibold text-foreground">Step 1 · Base PDF</p>
                                <p className="text-xs text-muted-foreground">
                                    This file receives the overlay on selected pages.
                                </p>
                            </div>
                            <UploadSingle
                                files={baseFiles.length ? [baseFiles[0]] : []}
                                onFilesChange={handleBaseFilesChange}
                                busy={busy}
                                onReset={handleResetBase}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="px-1">
                                <p className="text-sm font-semibold text-foreground">Step 2 · Overlay PDF</p>
                                <p className="text-xs text-muted-foreground">
                                    The overlay can be reused, matched by page number, or repeated in a cycle.
                                </p>
                            </div>
                            <UploadSingle
                                files={overlayFiles.length ? [overlayFiles[0]] : []}
                                onFilesChange={handleOverlayFilesChange}
                                busy={busy}
                                onReset={handleResetOverlay}
                            />
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="mx-auto mt-6 max-w-5xl rounded-lg border border-destructive/25 bg-destructive/10 p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                <section className="mx-auto max-w-6xl py-2 sm:py-4">
                    <div className="mx-auto max-w-4xl">
                        <OverlayAction
                            applyOverlay={handleApply}
                            busy={busy}
                            options={options}
                            setOptions={setOptionsWithInvalidate}
                            hasBothFiles={hasBothFiles}
                            onResetOptions={() => setOptionsWithInvalidate({ ...DEFAULT_OVERLAY_OPTIONS })}
                        />
                    </div>
                </section>

                {result && (
                    <section className="mx-auto max-w-6xl pb-6">
                        <div className="mx-auto max-w-4xl">
                            <OverlayResultPanel
                                result={result}
                                filename={downloadFilename}
                                setFilename={setDownloadFilename}
                                onPreview={handlePreviewOpen}
                                onDownload={handleDownload}
                            />
                        </div>
                    </section>
                )}
            </main>

            <Footer />

            <PdfPreviewDialog
                open={previewOpen}
                onOpenChange={handlePreviewOpenChange}
                pdfUrl={previewPdfUrl}
                title="Overlay PDF Preview"
                description="Review placement, opacity, and page mapping before downloading your file."
            />
        </div>
    )
}
