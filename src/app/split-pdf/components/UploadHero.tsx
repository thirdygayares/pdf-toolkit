"use client"

import type React from "react"
import { useRef, useState } from "react"
import type { DropResult } from "@hello-pangea/dnd"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, GripVertical, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { UploadedFile } from "@/hooks/useFileUpload"

interface Props {
    files: UploadedFile[]
    onFilesChange: (files: UploadedFile[]) => void
    busy?: boolean
    onReset?: () => void
}

const formatFileSize = (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`

const createUploadedFiles = (inputs: File[]) =>
    inputs
        .filter((file) => file.type === "application/pdf")
        .map((file) => ({
            id: Math.random().toString(36).slice(2, 11),
            name: file.name,
            size: file.size,
            file,
        }))

export const UploadSingle = ({ files, onFilesChange, busy = false, onReset }: Props) => {
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const openFileDialog = () => fileInputRef.current?.click()

    const appendFiles = (inputs: File[]) => {
        const processed = createUploadedFiles(inputs)
        if (processed.length > 0) {
            onFilesChange([...files, ...processed])
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        appendFiles(Array.from(event.target.files || []))
        event.target.value = ""
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        setDragging(false)
        appendFiles(Array.from(event.dataTransfer.files || []))
    }

    const handleRemoveFile = (id: string) => {
        onFilesChange(files.filter((file) => file.id !== id))
        if (files.length === 1) {
            onReset?.()
        }
    }

    const handleClearAll = () => {
        onFilesChange([])
        onReset?.()
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) {
            return
        }
        const reordered = Array.from(files)
        const [moved] = reordered.splice(result.source.index, 1)
        if (!moved) {
            return
        }
        reordered.splice(result.destination.index, 0, moved)
        onFilesChange(reordered)
    }

    return (
        <Card className="rounded-2xl border border-border/80 bg-card shadow-sm">
            <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Upload your PDFs</h2>
                    <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                        Multi-PDF supported
                    </span>
                </div>

                <div
                    onClick={openFileDialog}
                    onDragOver={(event) => {
                        event.preventDefault()
                        setDragging(true)
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault()
                        setDragging(false)
                    }}
                    onDrop={handleDrop}
                    className={cn(
                        "cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-8",
                        dragging ? "border-primary bg-primary/5" : "border-border bg-surface/45 hover:border-primary/40 hover:bg-accent/40",
                    )}
                >
                    <div className="mx-auto flex w-fit items-center justify-center rounded-full border border-border/80 bg-card p-3">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground sm:text-xl">Drop PDF files here</h3>
                    <p className="mt-1 text-sm text-muted-foreground">or click to browse from your device</p>
                    <p className="mt-2 text-xs text-muted-foreground">Upload and reorder files. The file order affects final split order.</p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleInputChange}
                />

                {files.length > 0 && (
                    <div className="mt-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">Selected files ({files.length})</p>
                            {busy && <p className="text-xs text-muted-foreground">Preparing pages...</p>}
                        </div>

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="split-upload-files">
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                                        {files.map((file, index) => (
                                            <Draggable key={file.id} draggableId={file.id} index={index}>
                                                {(draggableProvided, snapshot) => (
                                                    <div
                                                        ref={draggableProvided.innerRef}
                                                        {...draggableProvided.draggableProps}
                                                        className={cn("rounded-xl border border-border/80 bg-background px-3 py-2.5", snapshot.isDragging && "ring-2 ring-primary/25")}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                {...draggableProvided.dragHandleProps}
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
                                                                aria-label={`Reorder ${file.name}`}
                                                            >
                                                                <GripVertical className="h-4 w-4" />
                                                            </button>
                                                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border/80 bg-surface px-2 text-xs font-semibold text-foreground">
                                                                {index + 1}
                                                            </span>
                                                            <div className="rounded-lg border border-border/70 bg-surface p-2 text-primary">
                                                                <FileText className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-md text-muted-foreground hover:text-danger"
                                                                onClick={() => handleRemoveFile(file.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                                <span className="sr-only">Remove file</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-9 rounded-md" onClick={openFileDialog}>
                        {files.length > 0 ? "Add more files" : "Select files"}
                    </Button>
                    {files.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-9 rounded-md text-muted-foreground hover:text-danger" onClick={handleClearAll}>
                            <X className="mr-1.5 h-4 w-4" />
                            Clear all
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
