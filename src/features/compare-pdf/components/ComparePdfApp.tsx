"use client"

import { GitCompareArrows, Loader2, ShieldCheck, Sparkles } from "lucide-react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWarnBeforeCloseRefresh } from "@/hooks/useWarnBeforeCloseRefresh"
import { useComparePdf } from "../hooks/useComparePdf"
import { CompareUpload } from "./CompareUpload"
import { CompareWorkspace } from "./CompareWorkspace"

/**
 * Top-level compare-PDF experience: upload two PDFs, then hand off to the
 * side-by-side workspace. View state lives in CompareWorkspace, which is mounted
 * only once a comparison is ready (so it resets per comparison).
 */
export default function ComparePdfApp() {
    const { state, compare, reset } = useComparePdf()
    const { status, error, result, docs, progress } = state

    useWarnBeforeCloseRefresh(
        status === "comparing" || status === "ready",
        "You have an active PDF comparison. Refreshing or leaving will discard it.",
    )

    const isReady = status === "ready" && result && docs

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />

            <main className="container mx-auto flex-1 px-4 py-6 sm:py-8">
                {isReady ? (
                    <CompareWorkspace result={result} docs={docs} onReset={reset} />
                ) : (
                    <section className="mx-auto max-w-5xl space-y-6">
                        <Card className="rounded-2xl border-border/80 shadow-sm">
                            <CardHeader className="space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                                            <GitCompareArrows className="h-5 w-5 text-primary" />
                                            Compare PDFs
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Upload two PDFs to see them side by side with added and removed text highlighted.
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
                                <CompareUpload busy={status === "comparing"} onCompare={compare} />

                                {status === "comparing" ? (
                                    <div className="rounded-xl border border-border/80 bg-card p-4">
                                        <div className="flex items-center justify-between gap-2 text-sm">
                                            <span className="flex items-center gap-2 font-medium text-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                Comparing documents…
                                            </span>
                                            {progress ? (
                                                <span className="text-muted-foreground">
                                                    Page {progress.page} / {progress.totalPages}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
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
