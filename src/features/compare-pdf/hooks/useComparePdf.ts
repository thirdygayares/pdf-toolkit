"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api"
import type { CompareResult } from "../types"
import { compareDocuments, type CompareProgress } from "../lib/compare"
import { loadDocument } from "../lib/pdf"

export type CompareStatus = "idle" | "comparing" | "ready" | "error"

export interface CompareDocs {
    left: PDFDocumentProxy
    right: PDFDocumentProxy
}

export interface ComparePdfState {
    status: CompareStatus
    error: string | null
    result: CompareResult | null
    docs: CompareDocs | null
    progress: CompareProgress | null
}

const INITIAL_STATE: ComparePdfState = {
    status: "idle",
    error: null,
    result: null,
    docs: null,
    progress: null,
}

const MAX_FILE_BYTES = 100 * 1024 * 1024

async function destroyDoc(doc: PDFDocumentProxy | null | undefined) {
    if (!doc) return
    try {
        await doc.destroy()
    } catch {
        // no-op
    }
}

/**
 * Owns the lifecycle of a two-document comparison: loads both PDFs, runs the diff,
 * exposes the result and the live document proxies (for canvas rendering), and
 * tears proxies down on reset/unmount so we don't leak worker memory.
 */
export function useComparePdf() {
    const [state, setState] = useState<ComparePdfState>(INITIAL_STATE)
    const docsRef = useRef<CompareDocs | null>(null)
    const runIdRef = useRef(0)

    useEffect(() => {
        return () => {
            void destroyDoc(docsRef.current?.left)
            void destroyDoc(docsRef.current?.right)
            docsRef.current = null
        }
    }, [])

    const compare = useCallback(async (leftFile: File, rightFile: File) => {
        const runId = runIdRef.current + 1
        runIdRef.current = runId

        if (leftFile.size > MAX_FILE_BYTES || rightFile.size > MAX_FILE_BYTES) {
            setState({
                ...INITIAL_STATE,
                status: "error",
                error: `Each PDF must be ${Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB or smaller.`,
            })
            return
        }

        // Release any previous comparison before starting a new one.
        await destroyDoc(docsRef.current?.left)
        await destroyDoc(docsRef.current?.right)
        docsRef.current = null

        setState({ ...INITIAL_STATE, status: "comparing" })

        try {
            const [leftDoc, rightDoc] = await Promise.all([loadDocument(leftFile), loadDocument(rightFile)])
            if (runIdRef.current !== runId) {
                await destroyDoc(leftDoc)
                await destroyDoc(rightDoc)
                return
            }

            const result = await compareDocuments(leftDoc, rightDoc, leftFile.name, rightFile.name, {
                onProgress: (progress) => {
                    if (runIdRef.current === runId) {
                        setState((prev) => (prev.status === "comparing" ? { ...prev, progress } : prev))
                    }
                },
            })

            if (runIdRef.current !== runId) {
                await destroyDoc(leftDoc)
                await destroyDoc(rightDoc)
                return
            }

            docsRef.current = { left: leftDoc, right: rightDoc }
            setState({
                status: "ready",
                error: null,
                result,
                docs: { left: leftDoc, right: rightDoc },
                progress: null,
            })
        } catch (error) {
            if (runIdRef.current !== runId) return
            const message = error instanceof Error ? error.message : "Failed to compare the two PDFs."
            setState({ ...INITIAL_STATE, status: "error", error: message })
        }
    }, [])

    const reset = useCallback(() => {
        runIdRef.current += 1
        void destroyDoc(docsRef.current?.left)
        void destroyDoc(docsRef.current?.right)
        docsRef.current = null
        setState(INITIAL_STATE)
    }, [])

    return { state, compare, reset }
}
