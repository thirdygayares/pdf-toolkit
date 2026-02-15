"use client"

import { useState } from "react"
import { CheckCircle2, Download, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadedFile } from "@/hooks/useFileUpload"
import { usePdfMerger } from "@/hooks/usePdfMerger"
import useTruncatedFilename from "@/hooks/useTruncatedFilename"

interface DownloadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    files: UploadedFile[]
    onDownloadComplete?: () => void
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const kilo = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const unit = Math.floor(Math.log(bytes) / Math.log(kilo))
    return `${(bytes / Math.pow(kilo, unit)).toFixed(2)} ${sizes[unit]}`
}

export function DownloadModal({ open, onOpenChange, files, onDownloadComplete }: DownloadModalProps) {
    const [filename, setFilename] = useState("merged-document")
    const { mergePdfs, isProcessing } = usePdfMerger()
    const { truncate } = useTruncatedFilename()
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    const handleDownload = async () => {
        const success = await mergePdfs(files, filename.trim() || "merged-document")
        if (!success) {
            alert("Error merging PDFs. Please try again.")
            return
        }
        onOpenChange(false)
        onDownloadComplete?.()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-1.2rem)] rounded-2xl border-border/80 p-4 sm:max-w-2xl sm:p-6">
                <DialogHeader className="text-left">
                    <div className="rounded-xl border border-border/70 bg-surface/60 p-4 sm:p-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ready to download
                        </div>
                        <DialogTitle className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                            Your merged PDF is ready
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm sm:text-base">
                            Set your file name, review merge order, then download.
                        </DialogDescription>

                        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                            <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                                <p className="text-xs text-muted-foreground">Files</p>
                                <p className="text-sm font-semibold text-foreground sm:text-base">{files.length}</p>
                            </div>
                            <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                                <p className="text-xs text-muted-foreground">Total size</p>
                                <p className="text-sm font-semibold text-foreground sm:text-base">{formatSize(totalSize)}</p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="filename" className="text-sm font-medium text-foreground">
                            Output filename
                        </Label>
                        <div className="relative">
                            <Input
                                id="filename"
                                value={filename}
                                onChange={(event) => setFilename(event.target.value)}
                                className="h-11 border-border/80 bg-background pr-14"
                                disabled={isProcessing}
                                autoFocus
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                .pdf
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-surface/55 p-3.5 sm:p-4">
                        <p className="mb-3 text-sm font-semibold text-foreground">Merge order</p>
                        <ol className="max-h-52 space-y-2 overflow-y-auto pr-1">
                            {files.map((file, index) => (
                                <li key={file.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
                                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface text-xs font-semibold text-foreground">
                                        {index + 1}
                                    </span>
                                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                                    <span className="truncate text-sm text-foreground" title={file.name}>
                                        {truncate(file.name)}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex flex-col gap-2.5 border-t border-border/70 pt-3 sm:flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-10 rounded-lg border-border sm:min-w-32"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button className="h-10 rounded-lg sm:min-w-44" onClick={handleDownload} disabled={isProcessing}>
                            {isProcessing ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    Merging...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Download merged PDF
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
