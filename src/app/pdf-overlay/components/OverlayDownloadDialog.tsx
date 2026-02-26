"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface OverlayDownloadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    result: { base64: string; mime: string; originalName: string } | null
    filename: string
    setFilename: (filename: string) => void
    onDownload: () => void
}

export const OverlayDownloadDialog = ({
    open,
    onOpenChange,
    result,
    filename,
    setFilename,
    onDownload,
}: OverlayDownloadDialogProps) => {
    if (!result) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Download Overlaid PDF</DialogTitle>
                    <DialogDescription>
                        Your document is ready. You can rename the file before downloading.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="filename" className="text-sm font-medium leading-none">
                            File name
                        </label>
                        <input
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
