"use client"

import { useState } from "react"
import { GitCompareArrows, Loader2, ShieldCheck } from "lucide-react"
import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface CompareUploadProps {
    busy: boolean
    onCompare: (left: File, right: File) => void
}

/** Two-slot upload (Original + Revised) with a Compare action. */
export function CompareUpload({ busy, onCompare }: CompareUploadProps) {
    const [left, setLeft] = useState<File | null>(null)
    const [right, setRight] = useState<File | null>(null)

    const ready = Boolean(left && right) && !busy

    return (
        <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-danger/30 bg-danger/5 text-danger">
                            Original
                        </Badge>
                        <span className="text-sm text-muted-foreground">The baseline PDF (left side)</span>
                    </div>
                    <UploadSingle onFileReady={setLeft} hasFile={Boolean(left)} onReset={() => setLeft(null)} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-success/30 bg-success/5 text-success">
                            Revised
                        </Badge>
                        <span className="text-sm text-muted-foreground">The PDF to compare against (right side)</span>
                    </div>
                    <UploadSingle onFileReady={setRight} hasFile={Boolean(right)} onReset={() => setRight(null)} />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Compared in your browser
                    </Badge>
                    <span className="hidden text-xs text-muted-foreground sm:inline">PDFs never leave your device.</span>
                </div>
                <Button type="button" onClick={() => left && right && onCompare(left, right)} disabled={!ready}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitCompareArrows className="mr-2 h-4 w-4" />}
                    {busy ? "Comparing…" : "Compare PDFs"}
                </Button>
            </div>
        </div>
    )
}
