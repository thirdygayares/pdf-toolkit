"use client"

import { useState } from "react"
import { CheckCircle2, Download, Eye, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SplitResult } from "@/app/split-pdf/hooks/useSplitPdf"
import { base64ToBlob } from "@/lib/base64ToBlob"
import { PdfPreviewDialog } from "@/components/pdf/PdfPreviewDialog"

interface SplitDownloadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    result: SplitResult | null
    filename: string
    setFilename: (value: string) => void
    onDownload: () => void
}

const EMPTY_NAMES: string[] = []
const EMPTY_ORIGINS: Array<{ sourceName: string; sourcePageNumber: number }> = []

export const SplitDownloadDialog = ({
    open,
    onOpenChange,
    result,
    filename,
    setFilename,
    onDownload,
}: SplitDownloadDialogProps) => {
    const PREVIEW_ITEMS_LIMIT = 5
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewPdfUrl, setPreviewPdfUrl] = useState("")
    const sourceNames = result?.sourceNames ?? EMPTY_NAMES
    const selectedOrigins = result?.selectedOrigins ?? EMPTY_ORIGINS
    const previewOrigins = selectedOrigins.slice(0, PREVIEW_ITEMS_LIMIT)
    const remainingPages = Math.max(0, selectedOrigins.length - PREVIEW_ITEMS_LIMIT)
    const sourcePreview = sourceNames.slice(0, 3)
    const sourceOverflow = Math.max(0, sourceNames.length - sourcePreview.length)

    if (!result) {
        return null
    }

    const handlePreviewOpen = () => {
        if (!result) return
        if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl)
        }
        const blob = base64ToBlob(result.base64, result.mime)
        const nextUrl = URL.createObjectURL(blob)
        setPreviewPdfUrl(nextUrl)
        setIsPreviewOpen(true)
    }

    const handlePreviewOpenChange = (open: boolean) => {
        setIsPreviewOpen(open)
        if (!open && previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl)
            setPreviewPdfUrl("")
        }
    }

    const handleMainOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
            setIsPreviewOpen(false)
            if (previewPdfUrl) {
                URL.revokeObjectURL(previewPdfUrl)
                setPreviewPdfUrl("")
            }
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleMainOpenChange}>
                <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-x-hidden overflow-y-auto rounded-2xl border-border/80 p-4 sm:max-w-3xl sm:p-6">
                    <DialogHeader className="text-left">
                        <div className="rounded-xl border border-border/70 bg-surface/60 p-4 sm:p-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Split complete
                            </div>
                            <DialogTitle className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Ready to download
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm sm:text-base">
                                Rename your file if needed, then download right away.
                            </DialogDescription>

                            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                                <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                                    <p className="text-xs text-muted-foreground">Pages kept</p>
                                    <p className="text-sm font-semibold text-foreground sm:text-base">{selectedOrigins.length}</p>
                                </div>
                                <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                                    <p className="text-xs text-muted-foreground">Source</p>
                                    <p className="text-sm font-semibold text-foreground sm:text-base">
                                        {sourceNames.length} file{sourceNames.length > 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="split-filename" className="text-sm font-medium text-foreground">
                                Output filename
                            </Label>
                            <div className="relative">
                                <Input
                                    id="split-filename"
                                    value={filename}
                                    onChange={(event) => setFilename(event.target.value)}
                                    className="h-11 border-border/80 bg-background pr-14"
                                    autoFocus
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                    .pdf
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">The output keeps your selected page order.</p>
                        </div>

                        <div className="rounded-xl border border-border/80 bg-surface/55 p-3.5 sm:p-4">
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-foreground">Source files</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {sourcePreview.map((name) => (
                                        <span
                                            key={name}
                                            className="max-w-full truncate rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground"
                                            title={name}
                                        >
                                            {name}
                                        </span>
                                    ))}
                                    {sourceOverflow > 0 && (
                                        <span className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                            +{sourceOverflow} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/80 bg-surface/55 p-3.5 sm:p-4">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground">Output order</p>
                                <Badge variant="secondary" className="rounded-full border-primary/20 bg-primary/10 text-primary">
                                    {selectedOrigins.length} pages
                                </Badge>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                {previewOrigins.map((item, index) => (
                                    <span
                                        key={`${item.sourceName}-${item.sourcePageNumber}-${index}`}
                                        className="inline-flex min-w-0 items-center gap-1 rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground"
                                        title={`${item.sourceName} • p${item.sourcePageNumber}`}
                                    >
                                        <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                                        <span className="truncate">
                                            {item.sourceName} • p{item.sourcePageNumber}
                                        </span>
                                    </span>
                                ))}
                                {remainingPages > 0 && (
                                    <span className="inline-flex w-fit items-center rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                        +{remainingPages} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="sticky bottom-0 z-10 flex flex-col gap-2.5 border-t border-border/70 bg-background/95 pt-3 backdrop-blur sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={handlePreviewOpen} className="h-10 rounded-lg border-border sm:min-w-36">
                                <Eye className="h-4 w-4" />
                                Preview PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="h-10 rounded-lg border-border sm:min-w-32"
                            >
                                Keep editing
                            </Button>
                            <Button className="h-10 rounded-lg sm:min-w-44" onClick={onDownload}>
                                <span className="inline-flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </span>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <PdfPreviewDialog
                open={isPreviewOpen}
                onOpenChange={handlePreviewOpenChange}
                pdfUrl={previewPdfUrl}
                title="Split PDF Preview"
                description="Review pages before downloading your final file."
            />
        </>
    )
}
