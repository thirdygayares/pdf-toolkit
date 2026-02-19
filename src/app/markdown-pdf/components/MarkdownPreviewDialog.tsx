"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSheet, splitIntoPages } from "./PreviewPane";
import type { Theme, PageFormat, } from "./PreviewPane";
import { PAGE_DIMENSIONS } from "./PreviewPane";
import { useRef, useState } from "react";

interface MarkdownPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    markdown: string;
    theme: Theme;
    pageFormat: PageFormat;
    onExport: () => Promise<void>;
}

export const MarkdownPreviewDialog: React.FC<MarkdownPreviewDialogProps> = ({
    open,
    onOpenChange,
    markdown,
    theme,
    pageFormat,
    onExport,
}) => {
    const isTerminal = theme === "terminal";
    const pages = splitIntoPages(markdown || " ");
    const dims = PAGE_DIMENSIONS[pageFormat];
    const [exporting, setExporting] = useState(false);
    const dialogPagesRef = useRef<HTMLDivElement>(null);

    // Scale pages to fit inside the dialog nicely
    // Dialog content area is roughly 1200px wide at sm:max-w-5xl → we pick a nice scale
    const DIALOG_WIDTH = 900; // approx usable px
    const scale = Math.min(1, (DIALOG_WIDTH - 64) / dims.width);

    async function handleExport() {
        setExporting(true);
        try {
            await onExport();
        } finally {
            setExporting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-h-[95vh] overflow-hidden flex flex-col rounded-2xl border-border/80 p-0"
                style={{ maxWidth: "min(95vw, 1100px)", width: "95vw" }}
            >
                <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/70 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-semibold tracking-tight">
                                Full Preview
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-0.5">
                                {pages.length} {pages.length === 1 ? "page" : "pages"} · {pageFormat}
                            </DialogDescription>
                        </div>
                        <Button
                            className="gap-2 mr-8"
                            onClick={handleExport}
                            disabled={exporting}
                            size="sm"
                        >
                            {exporting ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Exporting…
                                </>
                            ) : (
                                <>
                                    <Download className="h-3.5 w-3.5" />
                                    Export PDF
                                </>
                            )}
                        </Button>
                    </div>
                </DialogHeader>

                {/* Pages scroll area */}
                <div
                    className={cn(
                        "flex-1 overflow-auto p-6",
                        isTerminal ? "bg-[#0a0d11]" : "bg-muted/40"
                    )}
                >
                    <div
                        ref={dialogPagesRef}
                        className="flex flex-col items-center gap-8"
                        style={{
                            // Scale the pages container so they fit the dialog
                            transformOrigin: "top center",
                            transform: scale < 1 ? `scale(${scale})` : undefined,
                            // When scaled down, shrink the container height accordingly so no gap appears
                            marginBottom: scale < 1 ? `calc((${scale} - 1) * ${dims.height * pages.length + 32 * (pages.length - 1)}px)` : undefined,
                        }}
                    >
                        {pages.map((pageContent, idx) => (
                            <PageSheet
                                key={idx}
                                content={pageContent}
                                theme={theme}
                                pageFormat={pageFormat}
                                pageNumber={idx + 1}
                                totalPages={pages.length}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-5 py-3 border-t border-border/70 flex-shrink-0">
                    <Button
                        variant="outline"
                        className="h-9 rounded-lg border-border min-w-24"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
