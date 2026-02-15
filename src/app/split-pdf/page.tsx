"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { SplitHero } from "@/app/split-pdf/components/SplitHero"
import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { SplitResult, useSplitPdf } from "@/app/split-pdf/hooks/useSplitPdf"
import { SelectionToolBar } from "@/app/split-pdf/components/SelectionToolBar"
import { PageSelectionHeader } from "@/app/split-pdf/components/PageSelectionHeader"
import { SplitPdfAction } from "@/app/split-pdf/components/SplitPdfAction"
import { FAQ } from "@/components/FAQ"
import { FaqSplitPdf } from "@/components/faqs/FaqSplitPdf"
import dynamic from "next/dynamic"
import { SplitDownloadDialog } from "@/app/split-pdf/components/SplitDownloadDialog"
import { base64ToBlob } from "@/lib/base64ToBlob"
import { toTimestamp } from "@/lib/toTimestamp"
import { UploadedFile } from "@/hooks/useFileUpload"

const SplitGrid = dynamic(() => import("./components/SplitGrid").then((module) => module.SplitGrid), {
    ssr: false,
})


export default function SplitPdfPage() {
    const { state, loadPdfs, clearAll, toggle, setAll, invert, reorderPages, splitPdf, includedCount } = useSplitPdf()
    const [columns, setColumns] = useState<1 | 2 | 3 | 4 | 5>(2)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [downloadOpen, setDownloadOpen] = useState(false)
    const [splitResult, setSplitResult] = useState<SplitResult | null>(null)
    const [downloadFilename, setDownloadFilename] = useState("")

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 767px)")

        const clampColumnsForMobile = () => {
            if (mediaQuery.matches) {
                setColumns((prev) => (prev > 2 ? 2 : prev))
            }
        }

        clampColumnsForMobile()
        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", clampColumnsForMobile)
        } else {
            mediaQuery.addListener(clampColumnsForMobile)
        }

        return () => {
            if (typeof mediaQuery.removeEventListener === "function") {
                mediaQuery.removeEventListener("change", clampColumnsForMobile)
            } else {
                mediaQuery.removeListener(clampColumnsForMobile)
            }
        }
    }, [])

    useEffect(() => {
        if (uploadedFiles.length === 0) {
            clearAll()
            return
        }
        void loadPdfs(uploadedFiles.map((item) => item.file))
    }, [uploadedFiles, loadPdfs, clearAll])

    const buildDefaultFilename = (sourceName: string, sourceCount = 1) => {
        const fallback = sourceCount > 1 ? `split-${sourceCount}-pdfs` : "split-document"
        const base = sourceName.replace(/\.pdf$/i, "").trim() || fallback
        return `${base} split ${toTimestamp()}`
    }

    const handleReset = () => {
        setUploadedFiles([])
        clearAll()
        setSplitResult(null)
        setDownloadOpen(false)
        setDownloadFilename("")
    }

    const handleSplit = async () => {
        const result = await splitPdf()
        if (!result) {
            return
        }
        setSplitResult(result)
        setDownloadFilename(buildDefaultFilename(result.originalName, result.sourceNames.length))
        setDownloadOpen(true)
    }

    const handleDownload = () => {
        if (!splitResult) {
            return
        }

        const baseName = (
            downloadFilename.trim() ||
            buildDefaultFilename(splitResult.originalName, splitResult.sourceNames.length)
        )
            .replace(/\.pdf$/i, "")
            .trim()
        const blob = base64ToBlob(splitResult.base64, splitResult.mime)
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = `${baseName || "split-document"}.pdf`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
        setDownloadOpen(false)
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-5xl space-y-7 sm:space-y-10">
                    <UploadSingle files={uploadedFiles} onFilesChange={setUploadedFiles} busy={state.busy} onReset={handleReset} />
                    {uploadedFiles.length === 0 && <SplitHero />}
                </section>

                {state.error && (
                    <div className="mx-auto mt-5 max-w-5xl rounded-lg border border-destructive/25 bg-destructive/10 p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">{state.error}</span>
                        </div>
                    </div>
                )}

                {state.pageCount > 0 && state.file && (
                    <section className="mx-auto max-w-6xl py-8 pb-28 sm:py-10 sm:pb-32">
                        <Card className="rounded-2xl border-border/80 shadow-sm">
                            <CardHeader className="pb-2">
                                <PageSelectionHeader state={state} includedCount={includedCount} columns={columns} />
                            </CardHeader>
                            <CardContent>
                                <SelectionToolBar setAll={setAll} invert={invert} columns={columns} setColumns={setColumns} />
                                <SplitGrid
                                    file={state.file}
                                    pageCount={state.pageCount}
                                    checked={state.checked}
                                    order={state.order}
                                    pageOrigins={state.pageOrigins}
                                    onToggle={toggle}
                                    onReorder={reorderPages}
                                    columns={columns}
                                />
                            </CardContent>
                        </Card>
                        <SplitPdfAction splitPdf={handleSplit} state={state} clearAll={handleReset} includedCount={includedCount} />
                    </section>
                )}
            </main>

            <div className="mt-12">
                <Separator className="mb-12" />
                <FAQ items={FaqSplitPdf} title="❓ FAQ" description="Common questions about PDF splitting" richResults accordionType="multiple" collapsible />
            </div>
            <Footer />

            <SplitDownloadDialog
                key={splitResult?.base64 ?? "split-download-dialog"}
                open={downloadOpen}
                onOpenChange={setDownloadOpen}
                result={splitResult}
                filename={downloadFilename}
                setFilename={setDownloadFilename}
                onDownload={handleDownload}
            />
        </div>
    )
}
