"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"

export interface UploadedFile {
    id: string
    name: string
    size: number
    file: File
}

export function useFileUpload() {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const processFiles = useCallback((newFiles: File[]) => {
        const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
        const processedFiles = pdfFiles.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            file,
        }))
        setFiles((prev) => [...prev, ...processedFiles]) // Remove .slice(0, 12)
    }, [])

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id))
    }, [])

    const reorderFiles = useCallback((startIndex: number, endIndex: number) => {
        setFiles((prev) => {
            const result = Array.from(prev)
            const [removed] = result.splice(startIndex, 1)
            result.splice(endIndex, 0, removed)
            return result
        })
    }, [])

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleFileInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(event.target.files || [])
            if (selectedFiles.length > 0) {
                processFiles(selectedFiles)
            }
            event.target.value = ""
        },
        [processFiles],
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const droppedFiles = Array.from(e.dataTransfer.files)
            processFiles(droppedFiles)
        },
        [processFiles],
    )

    return {
        files,
        fileInputRef,
        removeFile,
        reorderFiles,
        openFileDialog,
        handleFileInputChange,
        handleDrop,
        setFiles,
    }
}
