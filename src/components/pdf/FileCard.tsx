"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {ArrowDown, ArrowUp, FileIcon, GripVertical, MoreVertical, X} from "lucide-react"
import { UploadedFile } from "@/hooks/useFileUpload"

interface Props {
    file: UploadedFile
    index: number
    total: number
    onRemove: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    onMoveTo: (pos: number) => void
    dragHandleProps?: any
}

export const FileCard: React.FC<Props> = ({ file, index, total, onRemove, onMoveUp, onMoveDown, onMoveTo, dragHandleProps }) => {
    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg border-navy-200 hover:border-navy-300">
            <div {...dragHandleProps} className="text-navy-400 hover:text-navy-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="w-8 h-8 bg-navy-100 rounded text-center flex items-center justify-center font-bold text-sm text-navy-700">
                {index + 1}
            </div>

            <div className="w-10 h-10 bg-red-100 flex items-center justify-center rounded">
                <FileIcon className="text-red-600 w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-navy-900">{file.name}</p>
                <p className="text-sm text-navy-600">{formatSize(file.size)}</p>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-navy-400 hover:text-navy-600">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onMoveUp} disabled={index === 0}>
                        <ArrowUp className="w-4 h-4 mr-2" /> Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onMoveDown} disabled={index === total - 1}>
                        <ArrowDown className="w-4 h-4 mr-2" /> Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveTo(0)} disabled={index === 0}>
                        Make 1st
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveTo(total - 1)} disabled={index === total - 1}>
                        Make Last
                    </DropdownMenuItem>
                    {total > 2 && (
                        <DropdownMenuItem onClick={() => onMoveTo(Math.floor(total / 2))}>
                            Move to Middle
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={onRemove} variant="ghost" size="sm" className="w-8 h-8 p-0 text-navy-400 hover:text-red-600">
                <X className="w-4 h-4" />
            </Button>
        </div>
    )
}
