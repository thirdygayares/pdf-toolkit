"use client"

import type { DropResult } from "@hello-pangea/dnd"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { FileCard } from "@/components/pdf/FileCard"
import { Button } from "@/components/ui/button"
import { useFileActions } from "@/hooks/useFileActions"
import { UploadedFile } from "@/hooks/useFileUpload"

interface Props {
    files: UploadedFile[]
    onFilesChange: (files: UploadedFile[]) => void
    onMerge: () => void
}

export const FileManager: React.FC<Props> = ({ files, onFilesChange, onMerge }) => {
    const router = useRouter()
    const { removeFile, moveToPosition, moveUp, moveDown, addMoreFiles, handleDrop } = useFileActions(files, onFilesChange)

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return
        }
        const reorderedFiles = Array.from(files)
        const [movedFile] = reorderedFiles.splice(result.source.index, 1)
        reorderedFiles.splice(result.destination.index, 0, movedFile)
        onFilesChange(reorderedFiles)
    }

    return (
        <section
            className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6 lg:p-7"
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
        >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Rearrange files ({files.length})</h2>
                <Button onClick={addMoreFiles} variant="outline" size="sm" className="h-9 rounded-md px-3">
                    <Plus className="h-4 w-4" />
                    Add files
                </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="files">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                            {files.map((file, index) => (
                                <Draggable key={file.id} draggableId={file.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.draggableProps}
                                            ref={provided.innerRef}
                                            className={snapshot.isDragging ? "rounded-xl ring-2 ring-primary/30" : ""}
                                        >
                                            <FileCard
                                                file={file}
                                                index={index}
                                                total={files.length}
                                                dragHandleProps={provided.dragHandleProps}
                                                onRemove={() => removeFile(file.id)}
                                                onMoveUp={() => moveUp(file.id)}
                                                onMoveDown={() => moveDown(file.id)}
                                                onMoveTo={(position) => moveToPosition(file.id, position)}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button
                type="button"
                onClick={addMoreFiles}
                className="mt-4 w-full rounded-xl border-2 border-dashed border-border bg-surface/50 p-6 text-center transition-colors hover:border-primary/40 hover:bg-accent/40 sm:p-7"
            >
                <Plus className="mx-auto mb-2 h-7 w-7 text-primary" />
                <p className="text-sm font-medium text-foreground sm:text-base">Drop more PDFs here or click to browse</p>
            </button>

            <div className="mt-6 space-y-3 border-t border-border/70 pt-5">
                <Button className="h-11 w-full rounded-lg text-sm font-semibold sm:h-12" onClick={onMerge} size="lg" disabled={files.length === 0}>
                    Merge PDF files ({files.length})
                </Button>
                <Button variant="ghost" className="h-10 w-full rounded-lg text-sm" onClick={() => router.push("/")} size="lg">
                    Back to home
                </Button>
            </div>
        </section>
    )
}
