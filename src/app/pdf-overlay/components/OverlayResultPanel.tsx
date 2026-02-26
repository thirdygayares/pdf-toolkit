"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Download, Eye, FileText, Layers } from "lucide-react"
import type { OverlayResult } from "../hooks/usePdfOverlay"

interface OverlayResultPanelProps {
    result: OverlayResult | null
    filename: string
    setFilename: (value: string) => void
    onPreview: () => void
    onDownload: () => void
}

export const OverlayResultPanel = ({
    result,
    filename,
    setFilename,
    onPreview,
    onDownload,
}: OverlayResultPanelProps) => {
    if (!result) return null

    return (
        <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Overlay complete
                        </div>
                        <CardTitle className="pt-2 text-lg sm:text-xl">Preview and download</CardTitle>
                        <CardDescription>
                            Review the output PDF, confirm alignment, then download with your preferred filename.
                        </CardDescription>
                    </div>

                    <Badge variant="secondary" className="rounded-full">
                        {result.appliedPageCount} page{result.appliedPageCount === 1 ? "" : "s"} updated
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-border/80 bg-surface/55 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Base pages</p>
                        <p className="text-sm font-semibold text-foreground">{result.basePageCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-surface/55 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Overlay pages</p>
                        <p className="text-sm font-semibold text-foreground">{result.overlayPageCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-surface/55 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Applied</p>
                        <p className="text-sm font-semibold text-foreground">{result.appliedPageCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/80 bg-surface/55 px-3 py-2.5">
                        <p className="text-xs text-muted-foreground">Skipped</p>
                        <p className="text-sm font-semibold text-foreground">{result.skippedPageCount}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="overlay-result-filename">Output filename</Label>
                    <div className="relative">
                        <Input
                            id="overlay-result-filename"
                            value={filename}
                            onChange={(event) => setFilename(event.target.value)}
                            className="h-11 border-border/80 bg-background pr-14"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                            .pdf
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        The file stays in your browser. Nothing is uploaded to a server.
                    </p>
                </div>

                {result.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                        <div className="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                            <Layers className="h-4 w-4" />
                            <p className="text-sm font-semibold">Overlay notes</p>
                        </div>
                        <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                            {result.warnings.map((warning) => (
                                <li key={warning} className="flex items-start gap-2">
                                    <span className="mt-1 h-1 w-1 rounded-full bg-current" />
                                    <span>{warning}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex flex-col gap-2.5 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={onPreview} className="h-10 rounded-lg border-border sm:min-w-36">
                        <Eye className="h-4 w-4" />
                        Preview PDF
                    </Button>
                    <Button onClick={onDownload} className="h-10 rounded-lg sm:min-w-44">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/45 px-3 py-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span>
                            Tip: Use <span className="font-medium text-foreground">Preview PDF</span> to validate opacity,
                            placement, and page mapping before download.
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
