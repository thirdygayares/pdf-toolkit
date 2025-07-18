"use client"

import { useFileActions } from "@/hooks/useFileActions"
import { FileCard } from "@/components/pdf/FileCard"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { UploadedFile } from "@/hooks/useFileUpload"
import {useRouter} from "next/navigation";

interface Props {
    files: UploadedFile[]
    onFilesChange: (files: UploadedFile[]) => void
    onMerge: () => void
}

export const FileManager: React.FC<Props> = ({ files, onFilesChange, onMerge }) => {
    const router = useRouter();
    const { removeFile, moveToPosition, moveUp, moveDown, addMoreFiles, handleDrop } = useFileActions(files, onFilesChange)

    const handleDragEnd = (result: any) => {
        if (!result.destination) return
        const updated = Array.from(files)
        const [moved] = updated.splice(result.source.index, 1)
        updated.splice(result.destination.index, 0, moved)
        onFilesChange(updated)
    }

    return (
        <div className="bg-white p-6 border rounded-2xl" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold text-navy-900">Uploaded Files ({files.length})</h2>
                <Button onClick={addMoreFiles} variant="outline" size="sm" className="border-navy-200 text-navy-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add More
                </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="files">
                    {(provided) => (
                        <div  ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                            {files.map((file, index) => (
                                <Draggable key={file.id} draggableId={file.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div {...provided.draggableProps} ref={provided.innerRef}  className={snapshot.isDragging ? "shadow-md" : ""}>
                                            <FileCard
                                                file={file}
                                                index={index}
                                                total={files.length}
                                                dragHandleProps={provided.dragHandleProps}
                                                onRemove={() => removeFile(file.id)}
                                                onMoveUp={() => moveUp(file.id)}
                                                onMoveDown={() => moveDown(file.id)}
                                                onMoveTo={(pos) => moveToPosition(file.id, pos)}
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

            <div onClick={addMoreFiles} className="mt-4 border-2 border-dashed border-navy-300 rounded-lg p-8 text-center cursor-pointer hover:border-navy-400 hover:bg-navy-50">
                <Plus className="w-8 h-8 text-navy-400 mx-auto mb-2" />
                <p className="text-navy-500">Drop more PDF files here or click to browse</p>
            </div>

            <div className="mt-6 pt-6 border-t border-navy-200 flex flex-col gap-4">
                <Button className="w-full bg-primary text-white hover:bg-navy-800 cursor-pointer" onClick={onMerge} size="lg" disabled={files.length === 0}>
                    Merge PDF Files ({files.length})
                </Button>
                <Button variant="ghost" className="cursor-pointer" onClick={() => router.push("/")} size="lg" >
                    Back to Home
                </Button>
            </div>
        </div>
    )
}
