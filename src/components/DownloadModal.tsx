"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import {UploadedFile} from "@/hooks/useFileUpload";
import {usePdfMerger} from "@/hooks/usePdfMerger";
import useTruncatedFilename from "@/hooks/useTruncatedFilename";

interface DownloadModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    files: UploadedFile[]
    onDownloadComplete?: () => void
}

export function DownloadModal({ open, onOpenChange, files, onDownloadComplete }: DownloadModalProps) {
    const [filename, setFilename] = useState("merged-document")
    const { mergePdfs, isProcessing } = usePdfMerger()
    const { truncate } = useTruncatedFilename()

    const handleDownload = async () => {
        const success = await mergePdfs(files, filename)
        if (success) {
            onOpenChange(false)
            onDownloadComplete?.()
        } else {
            alert("Error merging PDFs. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <DialogHeader className="relative">

                    <div className="bg-gradient-to-r from-navy-600 to-navy-800 text-slate-950 p-6 rounded-lg -mx-6 -mt-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-950">Ready to Download!</DialogTitle>
                                <p className="text-slate-950/90 text-sm">Your merged PDF is ready</p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="filename" className="text-base font-medium text-navy-900">
                            File name:
                        </Label>
                        <Input
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="w-full border-navy-200 focus:border-navy-400"
                            disabled={isProcessing}
                        />
                    </div>

                    <div className="bg-navy-50 p-4 rounded-lg border border-navy-100">
                        <h4 className="font-medium text-navy-900 mb-2">Files to merge (in order):</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {files.map((file, index) => (
                                <div key={file.id} className="text-sm text-navy-600 flex items-center gap-2">
                  <span className="w-6 h-6 bg-navy-100 rounded text-navy-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                                    <span title={file.name}>{truncate(file.name)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 border-navy-200 bg-red-600 text-navy-700 hover:bg-navy-50"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-navy-700 hover:bg-navy-800 bg-primary text-slate-950"
                            onClick={handleDownload}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Merging...
                                </div>
                            ) : (
                                "Download PDF"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
