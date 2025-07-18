"use client"

import { useState } from "react"
import {UploadedFile} from "@/hooks/useFileUpload";

export function useFileStorage() {
    const [storedFiles, setStoredFiles] = useState<UploadedFile[]>([])

    const storeFiles = (files: UploadedFile[]) => {
        setStoredFiles(files)
        // Store file metadata in sessionStorage
        const fileMetadata = files.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
        }))
        sessionStorage.setItem("pdf-files-metadata", JSON.stringify(fileMetadata))
    }

    const getStoredFiles = () => {
        return storedFiles
    }

    const clearStoredFiles = () => {
        setStoredFiles([])
        sessionStorage.removeItem("pdf-files-metadata")
    }

    return {
        storeFiles,
        getStoredFiles,
        clearStoredFiles,
        storedFiles,
    }
}
