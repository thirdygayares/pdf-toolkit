"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileIcon, Plus, Upload, X } from "lucide-react"
import { UploadedFile, useFileUpload } from "@/hooks/useFileUpload"

interface FileUploadProps {
    onFilesReady: (files: UploadedFile[]) => void
}

export function FileUpload({ onFilesReady }: FileUploadProps) {
    const { files, fileInputRef, removeFile, openFileDialog, handleFileInputChange, handleDrop } = useFileUpload()
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)
    }

    const onDrop = (event: React.DragEvent) => {
        setIsDragging(false)
        handleDrop(event)
    }

    return (
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Upload your files</h2>
                <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                    PDF only, up to 100MB each
                </span>
            </div>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={onDrop}
                onClick={openFileDialog}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-9 ${
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface/40 hover:border-primary/40 hover:bg-accent/40"
                }`}
            >
                <div className="mx-auto flex w-fit items-center justify-center rounded-full border border-border/80 bg-card p-3">
                    <Upload className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
                </div>
                <p className="mt-4 text-base font-medium text-foreground sm:text-lg">Drag and drop PDF files here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse from your device</p>
            </div>

            {files.length > 0 && (
                <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground sm:text-base">Selected files ({files.length})</p>
                        <Button variant="outline" size="sm" className="h-8 rounded-md px-3 text-xs sm:text-sm" onClick={openFileDialog}>
                            <Plus className="h-3.5 w-3.5" />
                            Add more
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center gap-3 rounded-xl border border-border/80 bg-background px-3 py-3">
                                <div className="rounded-lg border border-border/70 bg-surface p-2 text-primary">
                                    <FileIcon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-md text-muted-foreground hover:text-danger"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        removeFile(file.id)
                                    }}
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
            />

            <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground sm:text-sm">
                    No account required. Files stay in your browser until you download the merged PDF.
                </p>
                <Button
                    size="lg"
                    className="h-11 rounded-lg px-6 text-sm font-semibold"
                    disabled={files.length === 0}
                    onClick={() => onFilesReady(files)}
                >
                    {files.length === 0 ? "Select files to continue" : `Arrange and merge (${files.length})`}
                </Button>
            </div>
        </section>
    )
}
