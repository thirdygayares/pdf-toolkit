"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { TextItem } from "pdfjs-dist/types/src/display/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { FAQ } from "@/components/FAQ"
import { ExtractTextFAQS } from "@/components/faqs/FaqExtractText"
import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { SelectionToolBar } from "@/app/split-pdf/components/SelectionToolBar"
import { useSplitPdf } from "@/app/split-pdf/hooks/useSplitPdf"
import type { UploadedFile } from "@/hooks/useFileUpload"
import { useWarnBeforeCloseRefresh } from "@/hooks/useWarnBeforeCloseRefresh"
import { toTimestamp } from "@/lib/toTimestamp"
import { Features } from "./Features"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Download, CheckCircle2 } from "lucide-react"

type PdfModule = typeof import("pdfjs-dist/build/pdf")

let cachedPdfModule: PdfModule | null = null

const loadPdfModule = async (): Promise<PdfModule> => {
    if (cachedPdfModule) {
        return cachedPdfModule
    }
    const pdfJsModule = await import("pdfjs-dist/build/pdf")
    pdfJsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
    cachedPdfModule = pdfJsModule
    return pdfJsModule
}

const parseCustomRange = (raw: string, pageCount: number): number[] => {
    if (pageCount <= 0) {
        throw new Error("Upload at least one PDF first.")
    }

    const input = raw.trim()
    if (!input) {
        throw new Error("Enter a range like 1-10.")
    }

    const tokens = input
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean)

    if (tokens.length === 0) {
        throw new Error("Invalid range. Use 1-10 or 1, 3, 7.")
    }

    const selected = new Set<number>()
    for (const token of tokens) {
        const match = /^(\d+)(?:-(\d+))?$/.exec(token)
        if (!match) {
            throw new Error(`Invalid token "${token}". Use 1-10 or 1, 3, 7.`)
        }

        const start = Number.parseInt(match[1], 10)
        const end = match[2] ? Number.parseInt(match[2], 10) : start

        if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
            throw new Error(`Range must be between 1 and ${pageCount}.`)
        }

        const from = Math.min(start, end)
        const to = Math.max(start, end)
        for (let page = from; page <= to; page += 1) {
            selected.add(page)
        }
    }

    return Array.from(selected).sort((a, b) => a - b)
}

const extractReadablePageText = (items: TextItem[]) => {
    const lines: string[] = []
    let current = ""

    for (const item of items) {
        const text = item.str?.trim()
        if (!text) {
            if (item.hasEOL && current.trim()) {
                lines.push(current.trim())
                current = ""
            }
            continue
        }

        if (current.length > 0) {
            current += " "
        }
        current += text

        if (item.hasEOL) {
            lines.push(current.trim())
            current = ""
        }
    }

    if (current.trim()) {
        lines.push(current.trim())
    }

    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

const buildTextFilename = (sources: string[]) => {
    const base = sources.length === 1 ? sources[0].replace(/\.pdf$/i, "") : `combined-${sources.length}-pdfs`
    return `${base || "extracted-text"}-${toTimestamp()}.txt`
}

export default function ExtractTextClientPage() {
    const { state, loadPdfs, clearAll, toggle, setAll, invert, setCheckedPages, includedCount } = useSplitPdf()
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [customRange, setCustomRange] = useState("")
    const [customRangeError, setCustomRangeError] = useState<string | null>(null)
    const [includePdfLabel, setIncludePdfLabel] = useState(true)
    const [includeSourcePageNumber, setIncludeSourcePageNumber] = useState(true)
    const [includeOutputOrder, setIncludeOutputOrder] = useState(true)
    const [separateSections, setSeparateSections] = useState(true)
    const [editorText, setEditorText] = useState("")
    const [extractError, setExtractError] = useState<string | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    const selectedIndexes = useMemo(() => state.order.filter((index) => state.checked[index]), [state.checked, state.order])
    const selectedOrigins = useMemo(
        () => selectedIndexes.map((index) => state.pageOrigins[index]).filter(Boolean),
        [selectedIndexes, state.pageOrigins],
    )
    const sourceCount = useMemo(() => new Set(selectedOrigins.map((item) => item.sourceName)).size, [selectedOrigins])
    const wordCount = useMemo(() => (editorText.trim() ? editorText.trim().split(/\s+/).length : 0), [editorText])
    const shouldWarn = uploadedFiles.length > 0 || state.pageCount > 0 || isExtracting || editorText.trim().length > 0

    useWarnBeforeCloseRefresh(
        shouldWarn,
        "You have unsaved extracted text. Refreshing or leaving this page will lose your current progress.",
    )

    useEffect(() => {
        if (uploadedFiles.length === 0) {
            clearAll()
            return
        }
        void loadPdfs(uploadedFiles.map((item) => item.file))
    }, [uploadedFiles, loadPdfs, clearAll])

    const handleReset = useCallback(() => {
        setUploadedFiles([])
        setCustomRange("")
        setCustomRangeError(null)
        setEditorText("")
        setExtractError(null)
        setIsExtracting(false)
        setCopySuccess(false)
        clearAll()
    }, [clearAll])

    const handleApplyCustomRange = useCallback(() => {
        try {
            const pages = parseCustomRange(customRange, state.pageCount)
            setCheckedPages(pages)
            setCustomRangeError(null)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid custom range."
            setCustomRangeError(message)
        }
    }, [customRange, setCheckedPages, state.pageCount])

    const handleToggle = useCallback(
        (index: number) => {
            setCustomRangeError(null)
            toggle(index)
        },
        [toggle],
    )

    const handleExtractText = useCallback(async () => {
        if (!state.file) {
            setExtractError("Please upload at least one PDF.")
            return
        }

        if (selectedIndexes.length === 0) {
            setExtractError("Select at least one page to extract text.")
            return
        }

        setIsExtracting(true)
        setExtractError(null)
        setCopySuccess(false)

        try {
            const pdfModule = await loadPdfModule()
            const bytes = await state.file.arrayBuffer()
            const task = pdfModule.getDocument({ data: bytes })
            const doc = await task.promise

            const sections: string[] = []
            for (let outputIndex = 0; outputIndex < selectedIndexes.length; outputIndex += 1) {
                const pageIndex = selectedIndexes[outputIndex]
                const pageNumber = pageIndex + 1
                const page = await doc.getPage(pageNumber)
                const textContent = await page.getTextContent()
                const body = extractReadablePageText(textContent.items.filter((item): item is TextItem => "str" in item)) || "(No text found on this page.)"
                const origin = state.pageOrigins[pageIndex]

                const labels: string[] = []
                if (includeOutputOrder) {
                    labels.push(`Output ${outputIndex + 1}`)
                }
                if (includePdfLabel && origin?.sourceName) {
                    labels.push(origin.sourceName)
                }
                if (includeSourcePageNumber && origin?.sourcePageNumber) {
                    labels.push(`Page ${origin.sourcePageNumber}`)
                }

                if (labels.length > 0) {
                    sections.push(`[${labels.join(" • ")}]\n${body}`)
                } else {
                    sections.push(body)
                }
            }

            const separator = separateSections ? "\n\n" : "\n"
            setEditorText(sections.join(separator).trim())
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to extract text from selected pages."
            setExtractError(message)
        } finally {
            setIsExtracting(false)
        }
    }, [
        includeOutputOrder,
        includePdfLabel,
        includeSourcePageNumber,
        selectedIndexes,
        separateSections,
        state.file,
        state.pageOrigins,
    ])

    const handleCopy = useCallback(async () => {
        if (!editorText.trim()) {
            return
        }
        try {
            await navigator.clipboard.writeText(editorText)
            setCopySuccess(true)
            window.setTimeout(() => setCopySuccess(false), 2000)
        } catch {
            setCopySuccess(false)
        }
    }, [editorText])

    const handleDownload = useCallback(() => {
        if (!editorText.trim()) {
            return
        }
        const blob = new Blob([editorText], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = buildTextFilename(state.sourceNames)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [editorText, state.sourceNames])

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-5xl space-y-7 sm:space-y-10">
                    <UploadSingle files={uploadedFiles} onFilesChange={setUploadedFiles} busy={state.busy || isExtracting} onReset={handleReset} />
                    {uploadedFiles.length === 0 && <Features />}
                </section>

                {(state.error || extractError) && (
                    <div className="mx-auto mt-5 max-w-5xl rounded-lg border border-destructive/25 bg-destructive/10 p-4">
                        <p className="font-medium text-destructive">{state.error || extractError}</p>
                    </div>
                )}

                {state.pageCount > 0 && state.file && (
                    <section className="mx-auto max-w-6xl py-8 pb-28 sm:py-10 sm:pb-32">
                        <Card className="rounded-2xl border-border/80 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="space-y-2.5">
                                    <CardTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                        Select pages to extract
                                    </CardTitle>
                                    <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
                                        Files: {state.sourceNames.length} • Pages: {state.pageCount} • Selected: {includedCount}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <SelectionToolBar
                                    setAll={(value) => {
                                        setCustomRangeError(null)
                                        setAll(value)
                                    }}
                                    invert={() => {
                                        setCustomRangeError(null)
                                        invert()
                                    }}
                                    showColumnControls={false}
                                    customRange={customRange}
                                    onCustomRangeChange={(value) => {
                                        setCustomRange(value)
                                        if (customRangeError) {
                                            setCustomRangeError(null)
                                        }
                                    }}
                                    onApplyCustomRange={handleApplyCustomRange}
                                    customRangeError={customRangeError}
                                    customRangePlaceholder={`1-${Math.min(10, Math.max(1, state.pageCount))}, 12-15`}
                                    tipText="Tip: use the checklist below to include only specific pages before extraction."
                                />

                                <div className="mb-5 grid gap-5 rounded-xl border border-border/70 bg-surface/45 p-3.5 lg:grid-cols-2 sm:p-4">
                                    <div className="space-y-3">
                                        <Label className="font-semibold text-foreground">Extraction config</Label>
                                        <div className="space-y-2.5">
                                            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
                                                <span className="text-sm text-foreground">Include PDF filename label</span>
                                                <Switch checked={includePdfLabel} onCheckedChange={setIncludePdfLabel} />
                                            </label>
                                            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
                                                <span className="text-sm text-foreground">Include source page number</span>
                                                <Switch checked={includeSourcePageNumber} onCheckedChange={setIncludeSourcePageNumber} />
                                            </label>
                                            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
                                                <span className="text-sm text-foreground">Include output order label</span>
                                                <Switch checked={includeOutputOrder} onCheckedChange={setIncludeOutputOrder} />
                                            </label>
                                            <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
                                                <span className="text-sm text-foreground">Separate pages with blank lines</span>
                                                <Switch checked={separateSections} onCheckedChange={setSeparateSections} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label className="font-semibold text-foreground">Page checklist</Label>
                                            <Badge variant="secondary">{includedCount} selected</Badge>
                                        </div>
                                        <div className="max-h-[420px] space-y-2 overflow-auto rounded-lg border border-border/70 bg-background p-2.5">
                                            {state.order.map((pageIndex, outputIndex) => {
                                                const selected = state.checked[pageIndex] ?? false
                                                const origin = state.pageOrigins[pageIndex]
                                                return (
                                                    <label
                                                        key={`checklist-${pageIndex}-${outputIndex}`}
                                                        className="flex items-center gap-3 rounded-md border border-border/60 px-2.5 py-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 accent-primary"
                                                            checked={selected}
                                                            onChange={() => handleToggle(pageIndex)}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-foreground">Output {outputIndex + 1}</p>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {origin?.sourceName || "Unknown source"} • page {origin?.sourcePageNumber || "?"}
                                                            </p>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6 rounded-2xl border-border/80 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <CardTitle className="text-xl font-semibold">Note Editor</CardTitle>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="secondary">Pages: {selectedIndexes.length}</Badge>
                                        <Badge variant="secondary">Sources: {sourceCount}</Badge>
                                        <Badge variant="secondary">Words: {wordCount}</Badge>
                                        <Badge variant="secondary">Chars: {editorText.length}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={editorText}
                                    onChange={(event) => setEditorText(event.target.value)}
                                    className="min-h-[360px] font-mono text-sm"
                                    placeholder="Extracted text will appear here. You can edit, delete, or add your own notes."
                                />
                            </CardContent>
                        </Card>

                        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-6 sm:px-4 sm:pb-4">
                            <div className="pointer-events-auto mx-auto max-w-6xl rounded-2xl border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur-md sm:p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Selected <span className="font-semibold text-foreground">{includedCount}</span> of{" "}
                                        <span className="font-semibold text-foreground">{state.pageCount}</span> pages
                                    </p>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2.5">
                                        <Button
                                            className="h-10 rounded-lg px-5 text-sm font-semibold"
                                            onClick={() => void handleExtractText()}
                                            disabled={isExtracting || includedCount === 0}
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Extracting...
                                                </>
                                            ) : (
                                                "Extract selected text"
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-lg px-4 text-sm"
                                            onClick={() => void handleCopy()}
                                            disabled={!editorText.trim()}
                                        >
                                            {copySuccess ? (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-10 rounded-lg px-4 text-sm"
                                            onClick={handleDownload}
                                            disabled={!editorText.trim()}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download TXT
                                        </Button>
                                        <Button variant="outline" className="h-10 rounded-lg px-4 text-sm" onClick={handleReset} disabled={isExtracting}>
                                            Start over
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <div className="mx-auto mt-12 max-w-6xl">
                    <FAQ
                        items={ExtractTextFAQS}
                        title="❓ FAQ"
                        description="Common questions about PDF text extraction"
                        richResults
                        accordionType="multiple"
                        collapsible
                    />
                </div>
            </main>

            <Footer />
        </div>
    )
}
