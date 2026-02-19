"use client";

import { useState, useRef, useCallback } from "react";
import { Separator } from "@/components/ui/separator";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { EditorPane, SAMPLE_MARKDOWN } from "@/app/markdown-pdf/components/EditorPane";
import { PreviewPane, type Theme, type PageFormat } from "@/app/markdown-pdf/components/PreviewPane";
import { Features } from "@/app/markdown-pdf/components/Features";
import { ConfigPanel } from "@/app/markdown-pdf/components/ConfigPanel";
import { MarkdownPreviewDialog } from "@/app/markdown-pdf/components/MarkdownPreviewDialog";
import { MarkdownPdfFAQS } from "@/components/faqs/FaqMarkdownPdf";
import { exportMarkdownPdf } from "@/app/markdown-pdf/lib/exportPdf";

// ─── Drag-resize hook ────────────────────────────────────────────────────────
function useSplitResize(initial = 0.6) {
    const [ratio, setRatio] = useState(initial);
    const dragging = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const onMouseMove = (ev: MouseEvent) => {
            if (!dragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newRatio = (ev.clientX - rect.left) / rect.width;
            setRatio(Math.min(0.85, Math.max(0.15, newRatio)));
        };

        const onMouseUp = () => {
            dragging.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    return { ratio, containerRef, onMouseDown };
}

// ─── Page ────────────────────────────────────────────────────────────────────
const MarkdownPdfPage: React.FC = () => {
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
    const [selectedTheme, setSelectedTheme] = useState<Theme>("documentation");
    const [pageFormat, setPageFormat] = useState<PageFormat>("A4");
    const [previewOpen, setPreviewOpen] = useState(false);
    const pagesRef = useRef<HTMLDivElement>(null);

    const { ratio, containerRef, onMouseDown } = useSplitResize(0.4);

    async function handleExport() {
        if (!pagesRef.current) return;
        const filename = `document-${pageFormat.toLowerCase()}.pdf`;
        await exportMarkdownPdf(pagesRef.current, pageFormat, filename, markdown, selectedTheme);
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col">
              {/* ── Config panel — contained ── */}
              <div className="px-4 py-8 sm:px-8 border-t border-border/60">
                <ConfigPanel
                  selectedTheme={selectedTheme}
                  onThemeChange={setSelectedTheme}
                  pageFormat={pageFormat}
                  onPageFormatChange={setPageFormat}
                  onExport={handleExport}
                />
              </div>

                {/* ── Split editor — full-width, fixed tall height ── */}
                <div className="flex flex-col border-t border-border/60 bg-card" style={{ height: "calc(100vh - 180px)", minHeight: 480 }}>
                    {/* Sub-header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 flex-shrink-0">
                        <div>
                            <span className="text-sm font-semibold text-foreground">
                                Split-screen editor
                            </span>
                            <span className="ml-3 text-xs text-muted-foreground hidden sm:inline">
                                Drag the handle to resize · Click <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">⤢</kbd> on preview to expand
                            </span>
                        </div>
                    </div>

                    {/* Resizable split — fills remaining height */}
                    <div
                        ref={containerRef}
                        className="flex flex-1 overflow-hidden"
                        style={{ minHeight: 0 }}
                    >
                        {/* ── Editor column ── */}
                        <div
                            className="flex-shrink-0 overflow-hidden"
                            style={{ width: `${ratio * 100}%` }}
                        >
                            <EditorPane value={markdown} onChange={setMarkdown} fullHeight />
                        </div>

                        {/* ── Drag handle ── */}
                        <div
                            onMouseDown={onMouseDown}
                            className="w-1 bg-border hover:bg-primary/60 active:bg-primary cursor-col-resize flex-shrink-0 transition-colors"
                        />

                        {/* ── Preview column ── */}
                        <div className="flex-1 overflow-hidden">
                            <PreviewPane
                                markdown={markdown}
                                theme={selectedTheme}
                                pageFormat={pageFormat}
                                pagesRef={pagesRef}
                                onOpenPreview={() => setPreviewOpen(true)}
                            />
                        </div>
                    </div>
                </div>



              {/* ── Hero section — contained ── */}
              <div className="px-4 py-6 sm:py-8 sm:px-8">
                <Features />
              </div>

                {/* ── FAQ ── */}
                <div className="px-4 pb-12 sm:px-8">
                    <Separator className="mb-10" />
                    <FAQ
                        items={MarkdownPdfFAQS}
                        title="❓ FAQ"
                        description="Common questions about the Markdown to PDF converter"
                        richResults
                        accordionType="multiple"
                        collapsible
                    />
                </div>
            </main>

            <Footer />

            {/* ── Full preview dialog ── */}
            <MarkdownPreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                markdown={markdown}
                theme={selectedTheme}
                pageFormat={pageFormat}
                onExport={handleExport}
            />
        </div>
    );
};

export default MarkdownPdfPage;
