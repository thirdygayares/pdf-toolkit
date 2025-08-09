"use client"

import { cn } from "@/lib/utils"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import { useEffect, useMemo, useState } from "react"
import { getDocument, GlobalWorkerOptions, version as pdfjsVersion } from "pdfjs-dist"
import { PdfThumbnail } from "@/app/split-pdf/components/PdfThumbnail"

interface SplitGridProps {
    file: File
    pageCount: number
    checked: boolean[]
    onToggle: (idx: number) => void
    columns: 1 | 2 | 3 | 4 | 5
}

export const SplitGrid = (props: SplitGridProps) => {
    const { pageCount, checked, onToggle, columns, file } = props
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)

    // Set the worker once
    GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`

    const gridCls = useMemo(() => {
        switch (columns) {
            case 1: return "grid-cols-1"
            case 2: return "grid-cols-2"
            case 3: return "grid-cols-3"
            case 4: return "grid-cols-4"
            case 5: return "grid-cols-5"

            default: return "grid-cols-5"
        }
    }, [columns])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const bytes = await file.arrayBuffer()
                const task = getDocument({ data: bytes })
                const proxy: PDFDocumentProxy = await task.promise
                if (!cancelled) setDoc(proxy)
            } catch (e) {
                console.error("Failed to load PDF for thumbnails:", e)
                setDoc(null)
            }
        })()
        return () => { cancelled = true; setDoc(null) }
    }, [file])

    return (
        <div className={cn("grid gap-4", gridCls)}>
            {Array.from({ length: pageCount }).map((_, i) => (
                <div key={i} className="min-w-0">
                    {doc ? (
                        <PdfThumbnail
                            doc={doc}
                            pageNumber={i + 1}
                            selected={checked[i] ?? false}
                            onToggle={() => onToggle(i)}
                            width={columns === 1 ? 720 : columns === 2 ? 360 : columns === 3 ? 240 : 200}
                        />
                    ) : (
                        <div className="aspect-[3/4] w-full bg-muted animate-pulse rounded-lg border" />
                    )}
                </div>
            ))}
        </div>
    )
}
