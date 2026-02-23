import { useState } from "react"
import { PDFDocument, rgb } from "pdf-lib"
import { UploadedFile } from "@/hooks/useFileUpload"

export type PositionX = "left" | "center" | "right"
export type PositionY = "top" | "bottom"
export type FormatStyle = "n" | "n_of_total" | "dash_n_dash"

export interface PageNumberOptions {
    positionX: PositionX
    positionY: PositionY
    margin: number
    formatStyle: FormatStyle
    fontSize: number
}

export interface PageNumberResult {
    base64: string
    mime: string
    originalName: string
}

export function usePageNumberPdf() {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const applyPageNumbers = async (
        file: UploadedFile,
        options: PageNumberOptions
    ): Promise<PageNumberResult | null> => {
        try {
            setBusy(true)
            setError(null)

            const arrayBuffer = await file.file.arrayBuffer()
            const pdfDoc = await PDFDocument.load(arrayBuffer)

            const pages = pdfDoc.getPages()
            const totalPages = pages.length

            pages.forEach((page, index) => {
                const { width, height } = page.getSize()
                const pageNumber = index + 1

                let text = `${pageNumber}`
                if (options.formatStyle === "n_of_total") {
                    text = `${pageNumber} of ${totalPages}`
                } else if (options.formatStyle === "dash_n_dash") {
                    text = `- ${pageNumber} -`
                }

                const fontSize = options.fontSize
                // Rough estimate for text width (usually about 0.5 * fontSize per char)
                const textWidth = text.length * fontSize * 0.5

                let x = options.margin
                if (options.positionX === "center") {
                    x = (width / 2) - (textWidth / 2)
                } else if (options.positionX === "right") {
                    x = width - textWidth - options.margin
                }

                let y = options.margin // bottom
                if (options.positionY === "top") {
                    y = height - options.margin - fontSize
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                })
            })

            const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true })
            const baseOut = pdfBytes.split(",")[1] || pdfBytes

            return {
                base64: baseOut,
                mime: "application/pdf",
                originalName: file.name,
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add page numbers")
            return null
        } finally {
            setBusy(false)
        }
    }

    return {
        applyPageNumbers,
        busy,
        error,
    }
}
