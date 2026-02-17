"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
    doc: PDFDocumentProxy | null;
    pageNumber: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const PagePreviewDialog = ({ doc, pageNumber, open, onOpenChange }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!doc || !pageNumber || !open) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const page = await doc.getPage(pageNumber);
                if (cancelled) {
                    return;
                }

                const viewport = page.getViewport({ scale: 1 });
                const maxWidth = Math.min(window.innerWidth * 0.78, 1200);
                const scale = Math.max(1, maxWidth / viewport.width);
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const renderViewport = page.getViewport({ scale: scale * dpr });
                const canvas = canvasRef.current;
                const context = canvas?.getContext("2d");

                if (!canvas || !context) {
                    throw new Error("Canvas unavailable.");
                }

                canvas.width = Math.max(1, Math.floor(renderViewport.width));
                canvas.height = Math.max(1, Math.floor(renderViewport.height));
                canvas.style.width = `${Math.max(1, Math.floor(renderViewport.width / dpr))}px`;
                canvas.style.height = `${Math.max(1, Math.floor(renderViewport.height / dpr))}px`;

                await page.render({ canvasContext: context, viewport: renderViewport }).promise;
                if (!cancelled) {
                    setLoading(false);
                }
            } catch (renderError) {
                if (cancelled) {
                    return;
                }
                setLoading(false);
                setError(renderError instanceof Error ? renderError.message : "Failed to render preview.");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [doc, pageNumber, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-hidden rounded-2xl border-border/80 p-4 sm:max-w-6xl sm:p-6">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        Page preview
                    </DialogTitle>
                    <DialogDescription>
                        {pageNumber ? `Page ${pageNumber}` : "Open a page to inspect text readability before conversion."}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border border-border/80 bg-surface/45 p-3">
                    {loading && (
                        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Rendering preview...
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex h-[60vh] items-center justify-center text-sm text-destructive">{error}</div>
                    )}

                    <div className={loading || error ? "hidden" : "max-h-[70vh] overflow-auto text-center"}>
                        <canvas ref={canvasRef} className="mx-auto block rounded-md border border-border/70 bg-background" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
