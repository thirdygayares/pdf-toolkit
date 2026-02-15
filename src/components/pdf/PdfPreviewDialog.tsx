"use client"

import { ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PdfPreviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pdfUrl: string
    title?: string
    description?: string
}

export const PdfPreviewDialog = ({
    open,
    onOpenChange,
    pdfUrl,
    title = "PDF Preview",
    description = "Preview your file before downloading.",
}: PdfPreviewDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-hidden rounded-2xl border-border/80 p-4 sm:max-w-5xl sm:p-6">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">{description}</DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border border-border/80 bg-surface/45 p-2 sm:p-3">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="PDF preview viewer"
                            className="h-[62vh] w-full rounded-lg border-0 bg-white"
                        />
                    ) : (
                        <div className="flex h-[40vh] items-center justify-center rounded-lg border border-border/70 bg-background p-4 text-sm text-muted-foreground">
                            No preview available.
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2.5 border-t border-border/70 pt-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" className="h-10 rounded-lg border-border sm:min-w-32" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button asChild className="h-10 rounded-lg sm:min-w-40" disabled={!pdfUrl}>
                        <a href={pdfUrl || "#"} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Open in new tab
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
