"use client"

import { useCallback, useMemo, useState } from "react"
import type { UploadedFile } from "@/hooks/useFileUpload"
import { generateId } from "../utils/generate-id"

export function useBatchFiles() {
    const [files, setFiles] = useState<UploadedFile[]>([])

    const addBatchFiles = useCallback((incoming: File[]) => {
        const pdfs = incoming.filter((file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name))
        if (pdfs.length === 0) return
        setFiles((prev) => [
            ...prev,
            ...pdfs.map((file) => ({
                id: generateId("batch-file"),
                name: file.name,
                size: file.size,
                file,
            })),
        ])
    }, [])

    const removeBatchFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id))
    }, [])

    const clearBatchFiles = useCallback(() => {
        setFiles([])
    }, [])

    const totalBytes = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files])

    return {
        files,
        totalBytes,
        addBatchFiles,
        removeBatchFile,
        clearBatchFiles,
        setFiles,
    }
}
