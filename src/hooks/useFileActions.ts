import { UploadedFile } from "@/hooks/useFileUpload"

export function useFileActions(files: UploadedFile[], onFilesChange: (files: UploadedFile[]) => void) {
    const removeFile = (id: string) => {
        onFilesChange(files.filter((file) => file.id !== id))
    }

    const moveToPosition = (fileId: string, newPosition: number) => {
        const index = files.findIndex((f) => f.id === fileId)
        if (index === -1) return
        const updated = [...files]
        const [file] = updated.splice(index, 1)
        updated.splice(newPosition, 0, file)
        onFilesChange(updated)
    }

    const moveUp = (fileId: string) => {
        const index = files.findIndex((f) => f.id === fileId)
        if (index > 0) moveToPosition(fileId, index - 1)
    }

    const moveDown = (fileId: string) => {
        const index = files.findIndex((f) => f.id === fileId)
        if (index < files.length - 1) moveToPosition(fileId, index + 1)
    }

    const addMoreFiles = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = true
        input.accept = ".pdf,application/pdf"
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            const selected = Array.from(target.files || [])
            const newFiles = selected.map((file) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                file,
            }))
            onFilesChange([...files, ...newFiles])
        }
        input.click()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf")
        const newFiles = dropped.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            file,
        }))
        onFilesChange([...files, ...newFiles])
    }

    return {
        removeFile,
        moveToPosition,
        moveUp,
        moveDown,
        addMoreFiles,
        handleDrop,
    }
}
