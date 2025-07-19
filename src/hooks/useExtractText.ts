"use client"

import { useState, useCallback } from "react"
import pdfToText from "react-pdftotext"

interface ExtractTextResult {
    text: string
    charCount: number
    fileName: string
}

interface UseExtractTextReturn {
    extractedData: ExtractTextResult | null
    isExtracting: boolean
    error: string | null
    extractText: (file: File) => Promise<void>
    clearData: () => void
}

export function useExtractText(): UseExtractTextReturn {
    const [extractedData, setExtractedData] = useState<ExtractTextResult | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const extractText = useCallback(async (file: File) => {
        if (!file || file.type !== "application/pdf") {
            setError("Please select a valid PDF file.")
            return
        }

        setIsExtracting(true)
        setError(null)
        setExtractedData(null)

        try {
            const text = await pdfToText(file)
            const trimmed = text.trim()

            if (!trimmed) {
                setError("No text found. This might be a scanned document that requires OCR.")
                return
            }

            setExtractedData({
                text: trimmed,
                charCount: trimmed.length,
                fileName: file.name,
            })
        } catch (err: any) {
            console.error("Error extracting text:", err)
            setError("Failed to extract text from PDF.")
        } finally {
            setIsExtracting(false)
        }
    }, [])

    const clearData = useCallback(() => {
        setExtractedData(null)
        setError(null)
    }, [])

    return {
        extractedData,
        isExtracting,
        error,
        extractText,
        clearData,
    }
}
