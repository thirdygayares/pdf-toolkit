import { useCallback, useMemo, useRef, useState } from "react"
import { PDFDocument } from "pdf-lib"
import { bytesToBase64 } from "@/lib/bytesToBase64"

export type SplitState = {
    file: File | null
    sourceNames: string[]
    pageOrigins: Array<{ sourceName: string; sourcePageNumber: number }>
    pageCount: number
    checked: boolean[]
    order: number[]
    busy: boolean
    error: string | null
}

export type SplitResult = {
    base64: string
    mime: string
    originalName: string
    sourceNames: string[]
    selectedPages: number[]
    selectedOrigins: Array<{ sourceName: string; sourcePageNumber: number }>
}

export const useSplitPdf = () => {
    const requestTokenRef = useRef(0)
    const [state, setState] = useState<SplitState>({
        file: null,
        sourceNames: [],
        pageOrigins: [],
        pageCount: 0,
        checked: [],
        order: [],
        busy: false,
        error: null,
    })

    const includedCount = useMemo(() => state.checked.filter(Boolean).length, [state.checked])

    const loadPdfs = useCallback(async (files: File[]) => {
        const pdfFiles = files.filter((file) => file.type === "application/pdf")
        if (pdfFiles.length === 0) {
            setState({
                file: null,
                sourceNames: [],
                pageOrigins: [],
                pageCount: 0,
                checked: [],
                order: [],
                busy: false,
                error: "Please upload at least one valid PDF file.",
            })
            return
        }

        const currentToken = ++requestTokenRef.current
        setState({
            file: null,
            sourceNames: pdfFiles.map((file) => file.name),
            pageOrigins: [],
            pageCount: 0,
            checked: [],
            order: [],
            busy: true,
            error: null,
        })

        try {
            const mergedDoc = await PDFDocument.create()
            const pageOrigins: Array<{ sourceName: string; sourcePageNumber: number }> = []

            for (const inputFile of pdfFiles) {
                const bytes = await inputFile.arrayBuffer()
                const doc = await PDFDocument.load(bytes)
                const pageIndexes = doc.getPageIndices()
                const copiedPages = await mergedDoc.copyPages(doc, pageIndexes)
                copiedPages.forEach((page) => mergedDoc.addPage(page))
                for (let pageNumber = 1; pageNumber <= pageIndexes.length; pageNumber += 1) {
                    pageOrigins.push({ sourceName: inputFile.name, sourcePageNumber: pageNumber })
                }
            }

            const mergedBytes = await mergedDoc.save()
            const pageCount = mergedDoc.getPageCount()
            const outputName = pdfFiles.length === 1 ? pdfFiles[0].name : `combined-${pdfFiles.length}-files.pdf`

            if (currentToken !== requestTokenRef.current) {
                return
            }

            setState({
                file: new File([mergedBytes], outputName, { type: "application/pdf" }),
                sourceNames: pdfFiles.map((file) => file.name),
                pageOrigins,
                pageCount,
                checked: Array(pageCount).fill(true),
                order: Array.from({ length: pageCount }, (_, index) => index),
                busy: false,
                error: null,
            })
        } catch {
            if (currentToken !== requestTokenRef.current) {
                return
            }
            setState({
                file: null,
                sourceNames: [],
                pageOrigins: [],
                pageCount: 0,
                checked: [],
                order: [],
                busy: false,
                error: "Invalid PDF file(s).",
            })
        }
    }, [])

    const clearAll = useCallback(() => {
        requestTokenRef.current += 1
        setState({
            file: null,
            sourceNames: [],
            pageOrigins: [],
            pageCount: 0,
            checked: [],
            order: [],
            busy: false,
            error: null,
        })
    }, [])

    const toggle = useCallback((index: number) => {
        setState((prev) => ({
            ...prev,
            checked: prev.checked.map((value, currentIndex) => (currentIndex === index ? !value : value)),
        }))
    }, [])

    const setAll = useCallback((value: boolean) => {
        setState((prev) => ({
            ...prev,
            checked: prev.checked.map(() => value),
        }))
    }, [])

    const invert = useCallback(() => {
        setState((prev) => ({
            ...prev,
            checked: prev.checked.map((value) => !value),
        }))
    }, [])

    const reorderPages = useCallback((startIndex: number, endIndex: number) => {
        setState((prev) => {
            if (startIndex === endIndex) {
                return prev
            }
            const nextOrder = Array.from(prev.order)
            const [moved] = nextOrder.splice(startIndex, 1)
            if (typeof moved !== "number") {
                return prev
            }
            nextOrder.splice(endIndex, 0, moved)
            return {
                ...prev,
                order: nextOrder,
            }
        })
    }, [])

    const splitPdf = useCallback(async (): Promise<SplitResult | null> => {
        if (!state.file) {
            setState((prev) => ({ ...prev, error: "Please upload at least one PDF." }))
            return null
        }

        const includeIndexes = state.order.filter((index) => state.checked[index])
        if (includeIndexes.length === 0) {
            setState((prev) => ({ ...prev, error: "Select at least one page to split." }))
            return null
        }

        setState((prev) => ({ ...prev, busy: true, error: null }))

        try {
            const sourceBytes = await state.file.arrayBuffer()
            const sourceDoc = await PDFDocument.load(sourceBytes)
            const outputDoc = await PDFDocument.create()
            const copiedPages = await outputDoc.copyPages(sourceDoc, includeIndexes)
            copiedPages.forEach((page) => outputDoc.addPage(page))

            const outputBytes = await outputDoc.save()
            const base64 = bytesToBase64(outputBytes)

            return {
                base64,
                mime: "application/pdf",
                originalName: state.file.name,
                sourceNames: state.sourceNames,
                selectedPages: includeIndexes.map((index) => index + 1),
                selectedOrigins: includeIndexes.map((index) => state.pageOrigins[index]).filter(Boolean),
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to split PDF."
            setState((prev) => ({ ...prev, error: message }))
            return null
        } finally {
            setState((prev) => ({ ...prev, busy: false }))
        }
    }, [state.checked, state.file, state.order, state.sourceNames, state.pageOrigins])

    return {
        state,
        loadPdfs,
        clearAll,
        toggle,
        setAll,
        invert,
        reorderPages,
        splitPdf,
        includedCount,
    }
}
