"use client"

import { useState } from "react"
import {UploadedFile} from "@/hooks/useFileUpload";

export function usePdfMerger() {
    const [isProcessing, setIsProcessing] = useState(false)

    const mergePdfs = async (files: UploadedFile[], filename: string) => {
        if (files.length === 0) return

        setIsProcessing(true)
        try {
            const { PDFDocument } = await import("pdf-lib")
            const mergedPdf = await PDFDocument.create()

            for (const file of files) {
                try {
                    const arrayBuffer = await file.file.arrayBuffer()
                    const pdf = await PDFDocument.load(arrayBuffer)
                    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
                    pages.forEach((page) => mergedPdf.addPage(page))
                } catch (error) {
                    console.error(`Error processing ${file.name}:`, error)
                }
            }

            const pdfBytes = await mergedPdf.save()
            const blob = new Blob([pdfBytes], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = url
            link.download = `${filename}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            return true
        } catch (error) {
            console.error("Error merging PDFs:", error)
            return false
        } finally {
            setIsProcessing(false)
        }
    }

    return { mergePdfs, isProcessing }
}
