"use client"

import { useSingleFileUpload } from "@/hooks/useSingleFileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X } from "lucide-react"

interface Props {
    onFileReady: (file: File) => void
    hasFile?: boolean
    onReset?: () => void
}

export const UploadSingle = (props: Props) => {
    const { onFileReady, hasFile, onReset } = props
    const { file, fileInputRef, openFileDialog, handleDrop, handleInputChange, removeFile } = useSingleFileUpload()

    return (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-8">
                {!file ? (
                    <div
                        onClick={openFileDialog}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="text-center cursor-pointer text-muted-foreground"
                    >
                        <Upload className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-1">Upload your PDF</h3>
                        <p className="text-sm mb-4">Drop a PDF file here or click to browse</p>
                        <Button variant="secondary" size="sm">
                            Select File
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handleInputChange}
                        />
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            <p className="font-medium text-foreground">{file.name}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button size="sm" onClick={() => onFileReady(file.file)}>
                                Use this PDF
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    removeFile()
                                    onReset?.()
                                }}
                            >
                                <X className="h-4 w-4 mr-1" /> Remove
                            </Button>
                        </div>
                        {hasFile && <p className="text-xs text-muted-foreground">Replaces the currently loaded file</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
