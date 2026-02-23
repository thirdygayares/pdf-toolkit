"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText } from "lucide-react"

interface PageNumberDownloadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    filename: string
    setFilename: (name: string) => void
    onDownload: () => void
}

export const PageNumberDownloadDialog = ({
    open,
    onOpenChange,
    filename,
    setFilename,
    onDownload,
}: PageNumberDownloadDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                        <Download className="h-6 w-6 text-success" />
                    </div>
                    <DialogTitle className="text-center text-xl">Page Numbers Added!</DialogTitle>
                    <DialogDescription className="text-center">
                        Your PDF has been successfully updated with page numbers and is ready to download.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 space-y-4">
                    <div className="space-y-2 rounded-lg border border-border bg-surface p-4">
                        <Label htmlFor="filename" className="text-xs font-semibold uppercase text-muted-foreground">
                            Save file as
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="filename"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="pl-9"
                                placeholder="numbered-document.pdf"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Close
                    </Button>
                    <Button onClick={onDownload} className="w-full gap-2 sm:w-auto">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
