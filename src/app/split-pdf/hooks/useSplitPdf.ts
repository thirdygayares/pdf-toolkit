import {useEffect, useMemo, useState} from "react";
import {PDFDocument} from "pdf-lib";
import {bytesToBase64} from "@/lib/bytesToBase64";
import {useRouter} from "next/navigation";

export type SplitState = {
    file: File | null
    pageCount: number
    checked: boolean[]
    busy: boolean
    error: string | null
}

export const useSplitPdf = () => {
    const router = useRouter()


    const [state, setState] = useState<SplitState>({
        file: null,
        pageCount: 0,
        checked: [],
        busy: false,
        error: null,
    })

    const includedCount = useMemo(() => state.checked.filter(Boolean).length, [state.checked])

    async function loadPdf(f: File) {
        setState((s) => ({ ...s, error: null, busy: true }))
        try {
            const bytes = await f.arrayBuffer()
            const doc = await PDFDocument.load(bytes)
            const n = doc.getPageCount()
            setState({ file: f, pageCount: n, checked: Array(n).fill(true), busy: false, error: null })
        } catch {
            setState({ file: null, pageCount: 0, checked: [], busy: false, error: "Invalid PDF file." })
        }
    }

    function clearAll() {
        setState({ file: null, pageCount: 0, checked: [], busy: false, error: null })
    }

    function toggle(idx: number) {
        setState((s) => ({ ...s, checked: s.checked.map((v, i) => (i === idx ? !v : v)) }))
    }

    function setAll(v: boolean) {
        setState((s) => ({ ...s, checked: s.checked.map(() => v) }))
    }

    function invert() {
        setState((s) => ({ ...s, checked: s.checked.map((v) => !v) }))
    }

    async function splitPdf() {
        if (!state.file) return setState((s) => ({ ...s, error: "Please upload a PDF." }))


        const include = state.checked.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)

        setState((s) => ({ ...s, busy: true, error: null }))

        try {
            const srcBytes = await state.file.arrayBuffer()
            const srcDoc = await PDFDocument.load(srcBytes)
            const outDoc = await PDFDocument.create()
            const copied = await outDoc.copyPages(srcDoc, include)
            copied.forEach((p) => outDoc.addPage(p))
            const outBytes = await outDoc.save()
            const base64 = bytesToBase64(outBytes)

            sessionStorage.setItem(
                "split-pdf-result",
                JSON.stringify({ base64, mime: "application/pdf", originalName: state.file.name }),
            )

            router.push(`/split-pdf/success?src=${encodeURIComponent(state.file.name)}`)
        } catch (e: any) {
            setState((s) => ({ ...s, error: e?.message || "Failed to split PDF." }))
        } finally {
            setState((s) => ({ ...s, busy: false }))
        }
    }

    useEffect(() => {
        try {
            sessionStorage.removeItem("split-pdf-result")
        } catch {}
    }, [])


    return {
        state,
        loadPdf,
        clearAll,
        toggle,
        setAll,
        invert,
        splitPdf,
        includedCount,
    }
}