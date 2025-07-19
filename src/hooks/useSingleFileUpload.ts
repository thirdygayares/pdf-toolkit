"use client"

import { useCallback, useRef, useState } from "react"

export interface UploadedFile {
    id: string
    name: string
    size: number
    file: File
}

export function useSingleFileUpload() {
    const [file, setFile] = useState<UploadedFile | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const processFile = useCallback((input: File) => {
        if (input.type === "application/pdf") {
            const newFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: input.name,
                size: input.size,
                file: input,
            }
            setFile(newFile)
        }
    }, [])

    const removeFile = useCallback(() => setFile(null), [])

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) processFile(selected)
        e.target.value = ""
    }, [processFile])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const dropped = e.dataTransfer.files[0]
        if (dropped) processFile(dropped)
    }, [processFile])

    return {
        file,
        fileInputRef,
        removeFile,
        openFileDialog,
        handleInputChange,
        handleDrop,
        setFile,
    }
}
