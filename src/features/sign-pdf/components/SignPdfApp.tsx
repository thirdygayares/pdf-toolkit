"use client"

import { PenTool, ShieldCheck, Sparkles } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadSingle } from "@/app/split-pdf/components/UploadHero"
import { useWarnBeforeCloseRefresh } from "@/hooks/useWarnBeforeCloseRefresh"
import { useSignPdf } from "../hooks/useSignPdf"
import { SignWorkspace } from "./SignWorkspace"

/**
 * Top-level Sign-PDF experience: upload a PDF, then place signatures on it and
 * download the flattened result. The workspace mounts only once a PDF is ready.
 */
export default function SignPdfApp() {
    const {
        state,
        loadFile,
        addPlacement,
        updatePlacement,
        removePlacement,
        clearPlacements,
        exportPdf,
        reset,
    } = useSignPdf()
    const { status, error, fileName, doc, pages, placements } = state

    useWarnBeforeCloseRefresh(
        status === "ready" || status === "exporting" || placements.length > 0,
        "You have an in-progress signed PDF. Refreshing or leaving will discard your placements.",
    )

    const isReady = (status === "ready" || status === "exporting") && doc && pages.length > 0

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />

            <main className="container mx-auto flex-1 px-4 py-6 sm:py-8">
                {isReady ? (
                    <SignWorkspace
                        fileName={fileName ?? "document.pdf"}
                        doc={doc}
                        pages={pages}
                        placements={placements}
                        exporting={status === "exporting"}
                        addPlacement={addPlacement}
                        updatePlacement={updatePlacement}
                        removePlacement={removePlacement}
                        clearPlacements={clearPlacements}
                        exportPdf={exportPdf}
                        onReset={reset}
                    />
                ) : (
                    <section className="mx-auto max-w-3xl space-y-6">
                        <Card className="rounded-2xl border-border/80 shadow-sm">
                            <CardHeader className="space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                                            <PenTool className="h-5 w-5 text-primary" />
                                            Sign PDF
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Upload a PDF, add your signature, initials, or a company stamp, then download the signed file.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                                            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Local processing
                                        </Badge>
                                        <Badge variant="outline">
                                            <Sparkles className="mr-1 h-3.5 w-3.5" /> No server upload
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <UploadSingle
                                    onFileReady={(file) => void loadFile(file)}
                                    hasFile={status === "loading"}
                                    onReset={reset}
                                />

                                {status === "loading" ? (
                                    <p className="text-sm text-muted-foreground">Opening your PDF…</p>
                                ) : null}

                                {error ? (
                                    <Alert variant="destructive">
                                        <AlertTitle>Something went wrong</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                ) : null}
                            </CardContent>
                        </Card>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    )
}
