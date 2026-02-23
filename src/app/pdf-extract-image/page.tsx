"use client";

import { useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadedFile } from "@/hooks/useFileUpload";
import { useWarnBeforeCloseRefresh } from "@/hooks/useWarnBeforeCloseRefresh";
import { Files, Images, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { UploadSingle } from "@/app/split-pdf/components/UploadHero";
import { ExtractHero } from "./components/ExtractHero";
import { ActionBar } from "./components/ActionBar";
import { UseCasesSection } from "./components/UseCasesSection";
import { ExtractImageFaqSection } from "./components/ExtractImageFaqSection";
import { ImagePreviewDialog } from "./components/ImagePreviewDialog";
import { ImageTile } from "./components/ImageTile";
import { useExtractImages } from "./hooks/useExtractImages";

export default function PdfExtractImagePage() {
    const {
        state,
        selectedCount,
        progressPercent,
        extract,
        reset,
        toggle,
        setAll,
        invert,
        remove,
        removeSelected,
        downloadSingle,
        downloadSelectedZip,
        downloadAllZip,
    } = useExtractImages();

    const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
    const [previewId, setPreviewId] = useState<string | null>(null);

    const previewItem = useMemo(() => state.items.find((item) => item.id === previewId) ?? null, [previewId, state.items]);
    const hasWorkspace = state.busy || state.docs.length > 0 || state.items.length > 0;
    const shouldWarn = pendingFiles.length > 0 || state.busy || state.items.length > 0;
    const pendingTotalBytes = pendingFiles.reduce((total, file) => total + file.size, 0);
    const isMultiSource = state.docs.length > 1;
    const sourcePreviewNames = state.docs.slice(0, 3);
    const sourceExtraCount = Math.max(0, state.docs.length - sourcePreviewNames.length);

    useWarnBeforeCloseRefresh(
        shouldWarn,
        "You have extracted images in progress. Refreshing or leaving this page will lose your current results.",
    );

    const handleExtract = async () => {
        if (pendingFiles.length === 0 || state.busy) return;
        setPreviewId(null);
        await extract(pendingFiles.map((entry) => entry.file));
    };

    const handleStartOver = () => {
        setPreviewId(null);
        setPendingFiles([]);
        reset();
    };

    const handleRemoveItem = (id: string) => {
        if (previewId === id) {
            setPreviewId(null);
        }
        remove(id);
    };

    const handleRemoveSelected = () => {
        if (previewItem && previewItem.selected) {
            setPreviewId(null);
        }
        removeSelected();
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-6 sm:py-10">
                <section className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
                    <Card className="rounded-2xl border-border/80 shadow-sm">
                        <CardHeader className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                                        <Images className="h-5 w-5 text-primary" />
                                        Extract images
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Upload one or many PDFs, extract, review, delete, and download in one screen.
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
                                files={pendingFiles}
                                onFilesChange={setPendingFiles}
                                busy={state.busy}
                                onReset={() => setPendingFiles([])}
                            />

                            {pendingFiles.length > 0 ? (
                                <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Files className="h-4 w-4 text-primary" />
                                            {pendingFiles.length} PDF{pendingFiles.length > 1 ? "s" : ""} selected
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(pendingTotalBytes)} total • PDFs stay on your device
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground" title={pendingFiles.map((item) => item.name).join(", ")}>
                                            {pendingFiles.slice(0, 3).map((item) => item.name).join(" • ")}
                                            {pendingFiles.length > 3 ? ` • +${pendingFiles.length - 3} more` : ""}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button type="button" onClick={() => void handleExtract()} disabled={state.busy}>
                                            {state.busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {state.busy
                                                ? "Extracting..."
                                                : `Extract images${pendingFiles.length > 1 ? ` from ${pendingFiles.length} PDFs` : ""}`}
                                        </Button>
                                        {(state.items.length > 0 || state.docs.length > 0) && (
                                            <Button type="button" variant="ghost" onClick={handleStartOver} disabled={state.busy}>
                                                Start over
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {state.busy && state.progressTotalFiles > 0 ? (
                                <div className="rounded-xl border border-border/80 bg-card p-4">
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                                        <span className="font-medium text-foreground">Extracting embedded images...</span>
                                        <span className="text-muted-foreground">
                                            File {Math.max(state.progressFile, 1)} / {state.progressTotalFiles}
                                            {state.progressTotalPages > 0
                                                ? ` • Page ${Math.min(state.progressPage, state.progressTotalPages)} / ${state.progressTotalPages}`
                                                : ""}
                                        </span>
                                    </div>
                                    {state.progressFileName ? (
                                        <p className="mb-2 truncate text-xs text-muted-foreground" title={state.progressFileName}>
                                            Current: {state.progressFileName}
                                        </p>
                                    ) : null}
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                            ) : null}

                            {state.error ? (
                                <Alert variant="destructive">
                                    <AlertTitle>Something went wrong</AlertTitle>
                                    <AlertDescription>{state.error}</AlertDescription>
                                </Alert>
                            ) : null}
                        </CardContent>
                    </Card>

                    {hasWorkspace ? (
                        <section className="space-y-4">
                            <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold text-foreground sm:text-xl">Review extracted images</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {state.docs.length > 0 ? (
                                                <>
                                                    {isMultiSource ? (
                                                        <>
                                                            Sources: <span className="font-medium">{state.docs.length} PDFs</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            Source: <span className="font-medium">{state.docs[0]}</span>
                                                        </>
                                                    )}
                                                    {state.totalPages > 0 ? ` • ${state.totalPages} total pages` : ""}
                                                    {` • ${state.items.length} images ready`}
                                                </>
                                            ) : (
                                                "Upload a PDF and click Extract images to start."
                                            )}
                                        </p>
                                        {isMultiSource ? (
                                            <p className="text-xs text-muted-foreground">
                                                {sourcePreviewNames.join(" • ")}
                                                {sourceExtraCount > 0 ? ` • +${sourceExtraCount} more` : ""}
                                            </p>
                                        ) : null}
                                    </div>
                                    {state.items.length > 0 ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">{selectedCount} selected</Badge>
                                            <Badge variant="outline">{state.items.length} active images</Badge>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {state.items.length === 0 && !state.busy && state.docs.length > 0 ? (
                                <Card className="rounded-xl border-border/80">
                                    <CardContent className="py-10 text-center">
                                        <p className="text-sm font-medium text-foreground">No images are currently in the result list.</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            The PDF(s) may not contain extractable embedded images, or you deleted them all.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {state.items.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {state.items.map((item) => (
                                            <ImageTile
                                                key={item.id}
                                                id={item.id}
                                                src={item.previewUrl}
                                                name={item.name}
                                                sourceName={item.sourceName}
                                                page={item.page}
                                                selected={item.selected}
                                                width={item.width}
                                                height={item.height}
                                                sizeLabel={formatBytes(item.bytes)}
                                                onToggle={() => toggle(item.id)}
                                                onPreview={() => setPreviewId(item.id)}
                                                onDownload={() => void downloadSingle(item.id)}
                                                onDelete={() => handleRemoveItem(item.id)}
                                            />
                                        ))}
                                    </div>
                                    <div className="h-24 sm:h-28" />
                                </>
                            ) : null}
                        </section>
                    ) : null}

                    <ExtractHero />
                    <UseCasesSection />

                    <ExtractImageFaqSection />
                </section>
            </main>

            <ActionBar
                total={state.items.length}
                selected={selectedCount}
                busy={state.busy}
                setAll={setAll}
                invert={invert}
                deleteSelected={handleRemoveSelected}
                downloadSelected={downloadSelectedZip}
                downloadAll={downloadAllZip}
            />

            <ImagePreviewDialog
                item={previewItem}
                open={Boolean(previewItem)}
                onOpenChange={(open) => {
                    if (!open) {
                        setPreviewId(null);
                    }
                }}
                onDownload={(id) => void downloadSingle(id)}
                onDelete={handleRemoveItem}
            />

            <Footer />
        </div>
    );
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}
