"use client"

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowDown, ArrowUp, FileIcon, GripVertical, MoreVertical, X } from "lucide-react"
import { UploadedFile } from "@/hooks/useFileUpload"

interface Props {
    file: UploadedFile
    index: number
    total: number
    onRemove: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    onMoveTo: (pos: number) => void
    dragHandleProps?: DraggableProvidedDragHandleProps
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const kilo = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const unit = Math.floor(Math.log(bytes) / Math.log(kilo))
    return Number.parseFloat((bytes / Math.pow(kilo, unit)).toFixed(2)) + " " + sizes[unit]
}

export const FileCard: React.FC<Props> = ({ file, index, total, onRemove, onMoveUp, onMoveDown, onMoveTo, dragHandleProps }) => {
    return (
        <article className="rounded-xl border border-border/80 bg-background px-3 py-3 shadow-sm sm:px-4">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    {...dragHandleProps}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
                    aria-label={`Reorder ${file.name}`}
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface px-2 text-xs font-semibold text-foreground">
                    {index + 1}
                </span>

                <div className="rounded-lg border border-border/70 bg-surface p-2 text-primary">
                    <FileIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Move options</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={onMoveUp} disabled={index === 0}>
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Move up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onMoveDown} disabled={index === total - 1}>
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Move down
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMoveTo(0)} disabled={index === 0}>
                            Move to first
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMoveTo(total - 1)} disabled={index === total - 1}>
                            Move to last
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={onRemove} variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-danger">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                </Button>
            </div>
        </article>
    )
}
