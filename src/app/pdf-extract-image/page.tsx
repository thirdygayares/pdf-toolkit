"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

import { ExtractHero } from "./components/ExtractHero";
import { ActionBar } from "./components/ActionBar";
import { ImageTile } from "./components/ImageTile";
import { useExtractImages } from "./hooks/useExtractImages";
import {UploadSingle} from "@/app/split-pdf/components/UploadHero";

export default function PdfExtractImagePage() {
    const {
        state,
        selectedCount,
        extract,
        reset,
        toggle,
        setAll,
        invert,
        setDedupe,
        downloadSingle,
        downloadSelectedZip,
        downloadAllZip,
    } = useExtractImages();

    const [pendingFile, setPendingFile] = useState<File | null>(null);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <div className="container mx-auto px-4 py-16">
                {/* Hero + Uploader */}
                {!state.doc && (
                    <div className="grid lg:grid-cols-2 gap-10 items-start">
                        <ExtractHero />
                        <div className="space-y-4">
                            <UploadSingle
                                onFileReady={(f) => setPendingFile(f)}
                                hasFile={Boolean(pendingFile)}
                                onReset={() => setPendingFile(null)}
                            />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Options</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <Switch
                                        id="dedupe"
                                        checked={state.dedupeByXref}
                                        onCheckedChange={(v) => setDedupe(v)}
                                    />
                                    <Label htmlFor="dedupe" className="cursor-pointer">
                                        Deduplicate identical images (by XRef)
                                    </Label>
                                </CardContent>
                            </Card>

                            <button
                                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                                disabled={!pendingFile || state.busy}
                                onClick={() => pendingFile && extract(pendingFile)}
                            >
                                {state.busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Extract images
                            </button>
                        </div>
                    </div>
                )}

                {/* Results */}
                {state.doc && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold">Images extracted</h2>
                                <p className="text-sm text-muted-foreground">
                                    Source: <span className="font-medium">{state.doc}</span> • Pages: {state.totalPages} • Images: {state.items.length}
                                </p>
                            </div>
                            <button
                                className="text-sm underline text-muted-foreground"
                                onClick={reset}
                                disabled={state.busy}
                            >
                                Start over
                            </button>
                        </div>

                        <ActionBar
                            total={state.items.length}
                            selected={selectedCount}
                            setAll={setAll}
                            invert={invert}
                            downloadSelected={downloadSelectedZip}
                            downloadAll={downloadAllZip}
                        />

                        {state.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Something went wrong</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {state.items.map((it) => (
                                <ImageTile
                                    key={it.name}
                                    name={it.name}
                                    page={it.page}
                                    selected={it.selected}
                                    onToggle={() => toggle(it.name)}
                                    onDownload={() => downloadSingle(it.name)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
