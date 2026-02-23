"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { AlertCircle } from "lucide-react"

import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { UploadedFile } from "@/hooks/useFileUpload"
import { base64ToBlob } from "@/lib/base64ToBlob"
import { toTimestamp } from "@/lib/toTimestamp"

import { PageNumberHero } from "./components/PageNumberHero"
import { PageNumberAction } from "./components/PageNumberAction"
import { PageNumberDownloadDialog } from "./components/PageNumberDownloadDialog"
import { usePageNumberPdf, PageNumberResult, PageNumberOptions } from "./hooks/usePageNumberPdf"

export default function PageNumberPdfPage() {
    const { applyPageNumbers, busy, error } = usePageNumberPdf()
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [downloadOpen, setDownloadOpen] = useState(false)
    const [result, setResult] = useState<PageNumberResult | null>(null)
    const [downloadFilename, setDownloadFilename] = useState("")

    const [options, setOptions] = useState<PageNumberOptions>({
        positionX: "center",
        positionY: "bottom",
        margin: 30,
        formatStyle: "n",
        fontSize: 12
    })

    const handleReset = () => {
        setUploadedFiles([])
        setResult(null)
        setDownloadOpen(false)
        setDownloadFilename("")
    }

    const buildDefaultFilename = (sourceName: string) => {
        const base = sourceName.replace(/\.pdf$/i, "").trim() || "document"
        return `${base}-numbered-${toTimestamp()}`
    }

    const handleApply = async () => {
        if (!uploadedFiles.length) return

        const res = await applyPageNumbers(uploadedFiles[0], options)
        if (!res) return

        setResult(res)
        setDownloadFilename(buildDefaultFilename(res.originalName))
        setDownloadOpen(true)
    }

    const handleDownload = () => {
        if (!result) return

        const baseName = (downloadFilename.trim() || buildDefaultFilename(result.originalName))
            .replace(/\.pdf$/i, "")
            .trim()

        const blob = base64ToBlob(result.base64, result.mime)
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `${baseName || "numbered-document"}.pdf`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
        setDownloadOpen(false)
    }

    const hasFile = uploadedFiles.length > 0

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-5xl space-y-7 sm:space-y-10">
                    <UploadSingle
                        files={uploadedFiles.length ? [uploadedFiles[0]] : []} // Enforce single file
                        onFilesChange={(files) => setUploadedFiles(files.slice(0, 1))}
                        busy={busy}
                        onReset={handleReset}
                    />
                    {!hasFile && <PageNumberHero />}
                </section>

                {error && (
                    <div className="mx-auto mt-5 max-w-5xl rounded-lg border border-destructive/25 bg-destructive/10 p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {hasFile && (
                    <section className="mx-auto max-w-3xl py-8 pb-28 sm:py-10 sm:pb-32">
                        <PageNumberAction
                            applyPageNumbers={handleApply}
                            busy={busy}
                            options={options}
                            setOptions={setOptions}
                            hasFile={hasFile}
                        />
                    </section>
                )}
            </main>

            <Footer />

            <PageNumberDownloadDialog
                key={result?.base64 ?? "page-number-download-dialog"}
                open={downloadOpen}
                onOpenChange={setDownloadOpen}
                filename={downloadFilename}
                setFilename={setDownloadFilename}
                onDownload={handleDownload}
            />
        </div>
    )
}
