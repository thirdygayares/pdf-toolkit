"use client";

import {base64ToBlob} from "@/lib/base64ToBlob";
import {useEffect, useMemo, useState} from "react";
import {ReadonlyURLSearchParams} from "next/navigation";
import {toTimestamp} from "@/lib/toTimestamp";

export type SplitResult = {
    base64: string
    mime: string
    originalName: string
}

export const useSplitPdfDownload = (params: ReadonlyURLSearchParams) => {
    const [open, setOpen] = useState(false)
    const [filename, setFilename] = useState("")
    const [result, setResult] = useState<SplitResult | null>(null)

    const defaultName = useMemo(() => {
        const src = params.get("src") || result?.originalName || "document.pdf"
        const base = src.replace(/\.pdf$/i, "")
        return `${base} split ${toTimestamp()}`
    }, [params, result])

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("split-pdf-result")
            if (!raw) return
            const parsed: SplitResult = JSON.parse(raw)
            setResult(parsed)
            setFilename(defaultName)
        } catch {
            console.error("Failed to parse split result from sessionStorage")
        }
    }, [])

    const confirmDownload = () => {
        try {
            if (!result) {
                throw new Error("No split result available. Please try again.")
            }
            const blob = base64ToBlob(result.base64, result.mime)
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${filename || defaultName}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            // Clear stored result after download
            sessionStorage.removeItem("split-pdf-result")
            setOpen(false)
        } catch (e) {
            console.error(e)
            setOpen(false)
        }
    }

    return { confirmDownload, open, setOpen, defaultName, result, setResult, filename, setFilename }
}