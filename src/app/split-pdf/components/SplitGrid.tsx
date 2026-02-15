"use client"

import { cn } from "@/lib/utils"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import { useEffect, useMemo, useState } from "react"
import { PdfThumbnail } from "@/app/split-pdf/components/PdfThumbnail"
import type { DropResult } from "@hello-pangea/dnd"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"

interface SplitGridProps {
    file: File
    pageCount: number
    checked: boolean[]
    order: number[]
    pageOrigins: Array<{ sourceName: string; sourcePageNumber: number }>
    onToggle: (idx: number) => void
    onReorder: (startIndex: number, endIndex: number) => void
    columns: 1 | 2 | 3 | 4 | 5
}

const getWidth = (columns: 1 | 2 | 3 | 4 | 5) => {
    switch (columns) {
        case 1:
            return 700
        case 2:
            return 300
        case 3:
            return 230
        case 4:
            return 190
        case 5:
            return 165
        default:
            return 250
    }
}

export const SplitGrid = ({ pageCount, checked, order, pageOrigins, onToggle, onReorder, columns, file }: SplitGridProps) => {
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)

    const gridClassName = useMemo(() => {
        switch (columns) {
            case 1:
                return "grid-cols-1"
            case 2:
                return "grid-cols-2"
            case 3:
                return "grid-cols-3"
            case 4:
                return "grid-cols-4"
            case 5:
                return "grid-cols-5"
            default:
                return "grid-cols-2"
        }
    }, [columns])

    const orderedPages = useMemo(() => {
        if (order.length === pageCount) {
            return order
        }
        return Array.from({ length: pageCount }, (_, index) => index)
    }, [order, pageCount])
    const thumbWidth = useMemo(() => getWidth(columns), [columns])

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || result.destination.index === result.source.index) {
            return
        }
        onReorder(result.source.index, result.destination.index)
    }

    useEffect(() => {
        let cancelled = false

        ;(async () => {
            try {
                const pdfModule = await import("pdfjs-dist/build/pdf")
                const worker = await import("pdfjs-dist/build/pdf.worker.min.js?url")

                pdfModule.GlobalWorkerOptions.workerSrc = worker.default

                const bytes = await file.arrayBuffer()
                const task = pdfModule.getDocument({ data: bytes })
                const proxy: PDFDocumentProxy = await task.promise

                if (!cancelled) {
                    setDoc(proxy)
                }
            } catch (error) {
                console.error("Failed to load PDF thumbnails:", error)
                if (!cancelled) {
                    setDoc(null)
                }
            }
        })()

        return () => {
            cancelled = true
        }
    }, [file])

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="split-pages-grid">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={cn("grid gap-3 sm:gap-4", gridClassName)}>
                        {orderedPages.map((pageIndex, index) => {
                            const pageNumber = pageIndex + 1
                            return (
                                <Draggable key={`page-${pageNumber}`} draggableId={`page-${pageNumber}`} index={index}>
                                    {(draggableProvided, snapshot) => (
                                        <div
                                            ref={draggableProvided.innerRef}
                                            {...draggableProvided.draggableProps}
                                            className={cn("min-w-0", snapshot.isDragging && "rounded-xl ring-2 ring-primary/25")}
                                        >
                                            {doc ? (
                                                <PdfThumbnail
                                                    doc={doc}
                                                    pageNumber={pageNumber}
                                                    pageIndex={pageIndex}
                                                    selected={checked[pageIndex] ?? false}
                                                    onToggle={onToggle}
                                                    width={thumbWidth}
                                                    dragHandleProps={draggableProvided.dragHandleProps}
                                                    sourceLabel={pageOrigins[pageIndex]?.sourceName}
                                                    sourcePageNumber={pageOrigins[pageIndex]?.sourcePageNumber}
                                                />
                                            ) : (
                                                <div className="aspect-[3/4] w-full animate-pulse rounded-xl border border-border/70 bg-muted" />
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            )
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
